import type { DatePlan } from "@/entities/date-plan/@x/report";
import { DATE_PLAN_LIMITS } from "@/entities/date-plan/@x/report";
import type { ClientInfo } from "@/entities/visitor/@x/report";
import { isValidIsoDate, isValidTime } from "@/shared/lib";
import type {
  NoAttemptStats,
  ReportPayload,
  ReportStage,
} from "../model/types";

// Generous upper bounds for the guard. sanitizeReportPayload trims to the real limits.
const MAX_RAW_STRING = 1000;
const STAGES: readonly ReportStage[] = [
  "envelope",
  "invitation",
  "planner",
  "celebration",
];
const SESSION_ID = /^[A-Za-z0-9-]{8,64}$/;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown, max = MAX_RAW_STRING): value is string {
  return typeof value === "string" && value.length <= max;
}

function isNumberIn(value: unknown, min: number, max: number): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}

function isCount(value: unknown): value is number {
  return isNumberIn(value, 0, 100_000) && Number.isInteger(value);
}

function isSize(value: unknown): boolean {
  return (
    isRecord(value) &&
    isNumberIn(value.width, 0, 100_000) &&
    isNumberIn(value.height, 0, 100_000)
  );
}

function isClientInfo(value: unknown): value is ClientInfo {
  return (
    isRecord(value) &&
    isSize(value.screen) &&
    isSize(value.viewport) &&
    isNumberIn(value.pixelRatio, 0, 20) &&
    isString(value.language, 100) &&
    isString(value.timezone, 100) &&
    typeof value.touch === "boolean"
  );
}

function isNoAttemptStats(value: unknown): value is NoAttemptStats {
  return (
    isRecord(value) &&
    isCount(value.total) &&
    isCount(value.hover) &&
    isCount(value.tap) &&
    isCount(value.focus) &&
    value.total === value.hover + value.tap + value.focus
  );
}

function isDatePlan(value: unknown): value is DatePlan {
  if (!isRecord(value) || !isRecord(value.location)) return false;
  const { location } = value;
  return (
    isString(location.id, 100) &&
    isString(location.label) &&
    location.label.trim().length > 0 &&
    isString(location.emoji, 32) &&
    typeof location.custom === "boolean" &&
    isString(value.date, 10) &&
    isValidIsoDate(value.date) &&
    isString(value.time, 5) &&
    isValidTime(value.time) &&
    isString(value.note)
  );
}

function isStage(value: unknown): value is ReportStage {
  return (
    typeof value === "string" && (STAGES as readonly string[]).includes(value)
  );
}

const isDuration = (value: unknown) => isNumberIn(value, 0, 7 * 24 * 3600);
const isRound = (value: unknown) =>
  isNumberIn(value, 1, 1000) && Number.isInteger(value);

/** Hand-written runtime guard for the /api/report body. */
export function isReportPayload(value: unknown): value is ReportPayload {
  if (!isRecord(value)) return false;
  if (!isString(value.sessionId, 64) || !SESSION_ID.test(value.sessionId))
    return false;
  if (!isClientInfo(value.client)) return false;

  switch (value.event) {
    case "visit":
      return true;
    case "accepted":
      return (
        isNoAttemptStats(value.noAttempts) &&
        isDatePlan(value.plan) &&
        isDuration(value.durationSec) &&
        isRound(value.round)
      );
    case "left":
      return (
        isStage(value.stage) &&
        isNoAttemptStats(value.noAttempts) &&
        isDuration(value.durationSec) &&
        isRound(value.round)
      );
    default:
      return false;
  }
}

function clean(value: string, max: number): string {
  return value.trim().slice(0, max);
}

/** Trims and length-limits every string. Call after isReportPayload. */
export function sanitizeReportPayload(payload: ReportPayload): ReportPayload {
  const client: ClientInfo = {
    ...payload.client,
    language: clean(payload.client.language, 35),
    timezone: clean(payload.client.timezone, 64),
  };
  const durationOf = (seconds: number) => Math.round(seconds);

  switch (payload.event) {
    case "visit":
      return { event: "visit", sessionId: payload.sessionId, client };
    case "left":
      return {
        event: "left",
        sessionId: payload.sessionId,
        client,
        stage: payload.stage,
        noAttempts: payload.noAttempts,
        durationSec: durationOf(payload.durationSec),
        round: payload.round,
      };
    case "accepted": {
      const { plan } = payload;
      return {
        event: "accepted",
        sessionId: payload.sessionId,
        client,
        noAttempts: payload.noAttempts,
        durationSec: durationOf(payload.durationSec),
        round: payload.round,
        plan: {
          location: {
            id: clean(plan.location.id, 40),
            label: clean(plan.location.label, DATE_PLAN_LIMITS.customLocation),
            emoji: clean(plan.location.emoji, 16),
            custom: plan.location.custom,
          },
          date: plan.date,
          time: plan.time,
          note: clean(plan.note, DATE_PLAN_LIMITS.note),
        },
      };
    }
  }
}
