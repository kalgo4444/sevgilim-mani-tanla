import type { DeviceInfo } from "@/entities/visitor/@x/report";
import {
  escapeHtml,
  formatDateTime,
  formatDuration,
  formatPlanDate,
} from "@/shared/lib";
import type {
  AcceptedReport,
  LeftReport,
  ReportPayload,
  ReportStage,
  VisitReport,
} from "../model/types";

/** Server-side facts added to every report. */
export interface ReportContext {
  ip: string;
  device: DeviceInfo;
  serverTime: Date;
  timezone: string;
}

const TELEGRAM_LIMIT = 4096;

const DEVICE_TYPE_LABEL: Record<DeviceInfo["type"], string> = {
  mobile: "Mobil",
  tablet: "Planshet",
  desktop: "Kompyuter",
};

const STAGE_LABEL: Record<ReportStage, string> = {
  envelope: "xat (konvert) ekrani",
  invitation: "taklif ekrani",
  planner: "joy va vaqt tanlash ekrani",
  celebration: "yakuniy ekran",
};

function formatDevice(device: DeviceInfo): string {
  const os = device.osVersion ? `${device.os} ${device.osVersion}` : device.os;
  const parts = [
    DEVICE_TYPE_LABEL[device.type],
    device.model,
    os,
    device.browser,
  ].filter((part): part is string => Boolean(part));
  return escapeHtml(parts.join(" · "));
}

function contextLines(ctx: ReportContext): string[] {
  return [
    `🌐 IP: ${escapeHtml(ctx.ip)}`,
    `📱 Qurilma: ${formatDevice(ctx.device)}`,
  ];
}

function timeLine(ctx: ReportContext): string {
  return `🕒 Vaqt: ${formatDateTime(ctx.serverTime, ctx.timezone)}`;
}

function formatVisit(report: VisitReport, ctx: ReportContext): string[] {
  const { screen, pixelRatio, language, timezone, touch } = report.client;
  const screenLine =
    `🖥 Ekran: ${screen.width}×${screen.height} (×${pixelRatio}), ` +
    `til: ${escapeHtml(language || "—")}, zona: ${escapeHtml(timezone || "—")}` +
    (touch ? ", sensorli" : "");
  return [
    "👀 <b>Sayt ochildi</b>",
    "",
    timeLine(ctx),
    ...contextLines(ctx),
    screenLine,
  ];
}

function formatAccepted(
  report: AcceptedReport,
  ctx: ReportContext,
  withNote: boolean,
): string[] {
  const { plan, noAttempts } = report;
  const repeat = report.round > 1 ? ` (yana, ${report.round}-marta)` : "";
  const place = plan.location.custom
    ? `${escapeHtml(plan.location.emoji)} ${escapeHtml(plan.location.label)} (o‘zi yozdi)`
    : `${escapeHtml(plan.location.emoji)} ${escapeHtml(plan.location.label)}`;
  const lines = [
    `✅ <b>U ROZI BO‘LDI!</b> 💍${repeat}`,
    "",
    `📍 Joy: ${place}`,
    `🗓 Sana: ${escapeHtml(formatPlanDate(plan.date))}`,
    `⏰ Soat: ${escapeHtml(plan.time)}`,
  ];
  if (withNote && plan.note) lines.push(`📝 Izoh: ${escapeHtml(plan.note)}`);
  lines.push(
    "",
    `🙈 "Yo‘q" ga urinishlar: ${noAttempts.total}`,
    `   ├ yaqinlashdi: ${noAttempts.hover}`,
    `   ├ bosmoqchi bo‘ldi: ${noAttempts.tap}`,
    `   └ klaviatura: ${noAttempts.focus}`,
    `⏱ Saytda: ${formatDuration(report.durationSec)}`,
    "",
    ...contextLines(ctx),
    timeLine(ctx),
  );
  return lines;
}

function formatLeft(report: LeftReport, ctx: ReportContext): string[] {
  return [
    "🚪 <b>Javob bermasdan chiqib ketdi</b>",
    "",
    `📌 Bosqich: ${STAGE_LABEL[report.stage]}`,
    `🙈 "Yo‘q" ga urinishlar: ${report.noAttempts.total}`,
    `⏱ Saytda: ${formatDuration(report.durationSec)}`,
    ...contextLines(ctx),
    timeLine(ctx),
  ];
}

/** Builds the Uzbek Telegram message (parse_mode HTML). All user text is escaped. */
export function formatReportMessage(
  report: ReportPayload,
  ctx: ReportContext,
): string {
  switch (report.event) {
    case "visit":
      return formatVisit(report, ctx).join("\n");
    case "left":
      return formatLeft(report, ctx).join("\n");
    case "accepted": {
      const full = formatAccepted(report, ctx, true).join("\n");
      // Inputs are length-limited, so this is a safety net: drop the note rather than cut HTML.
      return full.length <= TELEGRAM_LIMIT
        ? full
        : formatAccepted(report, ctx, false).join("\n");
    }
  }
}
