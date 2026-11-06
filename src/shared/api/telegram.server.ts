import "server-only";

const TELEGRAM_TIMEOUT_MS = 8000;

interface TelegramConfig {
  token: string;
  chatId: string;
}

export type TelegramSendResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "failed" };

let warnedMissingConfig = false;

/** Reads the bot settings. Returns null (and warns once) if either is missing. */
export function getTelegramConfig(): TelegramConfig | null {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (token && chatId) return { token, chatId };
  if (!warnedMissingConfig) {
    warnedMissingConfig = true;
    console.warn(
      "[report] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set. Reports are disabled; add them to .env.local.",
    );
  }
  return null;
}

function isTelegramOk(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    value.ok === true
  );
}

/** Sends an HTML message to the owner's chat. Never throws and never logs secrets. */
export async function sendTelegramMessage(
  text: string,
): Promise<TelegramSendResult> {
  const config = getTelegramConfig();
  if (!config) return { ok: false, reason: "not-configured" };

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${config.token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
        cache: "no-store",
      },
    );
    const data: unknown = await response.json().catch(() => null);
    if (response.ok && isTelegramOk(data)) return { ok: true };
    // Log only the status: the response body can echo request details.
    console.error(
      `[report] Telegram rejected the message (HTTP ${response.status}).`,
    );
    return { ok: false, reason: "failed" };
  } catch (error) {
    const name = error instanceof Error ? error.name : "UnknownError";
    console.error(`[report] Telegram request failed (${name}).`);
    return { ok: false, reason: "failed" };
  }
}
