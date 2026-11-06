import type { DatePlan } from "@/entities/date-plan/@x/report";
import type { ClientInfo } from "@/entities/visitor/@x/report";

export type ReportStage = "envelope" | "invitation" | "planner" | "celebration";

export type NoAttemptKind = "hover" | "tap" | "focus";

export interface NoAttemptStats {
  total: number;
  hover: number;
  tap: number;
  focus: number;
}

interface ReportBase {
  /** crypto.randomUUID(), once per page load. */
  sessionId: string;
  client: ClientInfo;
}

export interface VisitReport extends ReportBase {
  event: "visit";
}

export interface AcceptedReport extends ReportBase {
  event: "accepted";
  noAttempts: NoAttemptStats;
  plan: DatePlan;
  durationSec: number;
  /** 1 for the first answer, 2+ after "replay". */
  round: number;
}

export interface LeftReport extends ReportBase {
  event: "left";
  stage: ReportStage;
  noAttempts: NoAttemptStats;
  durationSec: number;
  round: number;
}

export type ReportPayload = VisitReport | AcceptedReport | LeftReport;

export type ReportEvent = ReportPayload["event"];
