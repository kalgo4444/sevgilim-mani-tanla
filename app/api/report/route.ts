import {
  formatReportMessage,
  isReportPayload,
  sanitizeReportPayload,
} from "@/entities/report";
import { parseUserAgent } from "@/entities/visitor";
import {
  getTelegramConfig,
  sendTelegramMessage,
} from "@/shared/api/telegram.server";
import { invitationConfig } from "@/shared/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4 * 1024;
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;
const UNKNOWN_IP = "noma’lum";

/**
 * In-memory rate limit per IP. It lives in this server instance only and
 * resets on every cold start or redeploy. That is fine for a personal page.
 */
const hits = new Map<string, number[]>();

function isRateLimited(ip: string, now: number): boolean {
  const recent = (hits.get(ip) ?? []).filter(
    (time) => now - time < RATE_WINDOW_MS,
  );
  recent.push(now);
  hits.set(ip, recent);
  // Keep the map small: drop idle IPs now and then.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((time) => now - time >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > RATE_LIMIT;
}

function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded.slice(0, 64);
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 64);
  return UNKNOWN_IP;
}

function json(body: { ok: boolean }, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/** Reads the body as text, stopping as soon as it passes the limit. */
async function readBodyLimited(
  request: Request,
  limit: number,
): Promise<string | null> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > limit) return null;
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

// Only POST is exported, so Next.js answers every other method with 405.
export async function POST(request: Request): Promise<Response> {
  const ip = getClientIp(request.headers);
  if (isRateLimited(ip, Date.now())) return json({ ok: false }, 429);

  let text: string | null;
  try {
    text = await readBodyLimited(request, MAX_BODY_BYTES);
  } catch {
    return json({ ok: false }, 400);
  }
  if (text === null) return json({ ok: false }, 413);

  const data = parseJson(text);
  if (!isReportPayload(data)) return json({ ok: false }, 400);

  if (!getTelegramConfig()) return json({ ok: false }, 503);

  const message = formatReportMessage(sanitizeReportPayload(data), {
    ip,
    device: parseUserAgent(request.headers.get("user-agent")),
    serverTime: new Date(),
    timezone: invitationConfig.report.timezone,
  });

  const result = await sendTelegramMessage(message);
  if (result.ok) return json({ ok: true }, 200);
  return json({ ok: false }, result.reason === "not-configured" ? 503 : 502);
}
