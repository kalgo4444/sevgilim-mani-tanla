"use client";

import { useCallback, useEffect, useRef } from "react";
import type { DatePlan } from "@/entities/date-plan";
import type {
  NoAttemptKind,
  NoAttemptStats,
  ReportPayload,
  ReportStage,
} from "@/entities/report";
import { collectClientInfo } from "@/entities/visitor";
import { beaconReport, postReport } from "@/shared/api";
import { createId } from "@/shared/lib";

const VISIT_KEY = "invitation:visit-reported";

/** Seconds since the page started loading. */
const durationSec = () => Math.round(performance.now() / 1000);

const emptyStats = (): NoAttemptStats => ({
  total: 0,
  hover: 0,
  tap: 0,
  focus: 0,
});

let warnedOnce = false;
function warnInDev(): void {
  if (process.env.NODE_ENV !== "development" || warnedOnce) return;
  warnedOnce = true;
  console.warn(
    "[report] Could not deliver a report. The site keeps working; check the server log.",
  );
}

/** sessionStorage can throw (private mode, blocked storage). */
function markVisitOnce(): boolean {
  try {
    if (sessionStorage.getItem(VISIT_KEY)) return false;
    sessionStorage.setItem(VISIT_KEY, "1");
    return true;
  } catch {
    return true;
  }
}

/**
 * Sends visit / accepted / left reports. "No" attempts are counted in refs
 * (no re-renders) and sent only as totals.
 */
export function useTelegramReport(stage: ReportStage) {
  const sessionIdRef = useRef("");
  const attemptsRef = useRef<NoAttemptStats>(emptyStats());
  const roundRef = useRef(1);
  const acceptedRef = useRef(false);
  const leftSentRef = useRef(false);
  const stageRef = useRef<ReportStage>(stage);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  const getSessionId = useCallback(() => {
    if (!sessionIdRef.current) sessionIdRef.current = createId();
    return sessionIdRef.current;
  }, []);

  // Visit: once per tab, so a refresh does not send it again.
  useEffect(() => {
    if (!markVisitOnce()) return;
    const payload: ReportPayload = {
      event: "visit",
      sessionId: getSessionId(),
      client: collectClientInfo(),
    };
    postReport(payload).then((ok) => {
      if (!ok) warnInDev();
    });
  }, [getSessionId]);

  // Left: she closes or hides the tab before answering. Sent once.
  useEffect(() => {
    const sendLeft = () => {
      if (acceptedRef.current || leftSentRef.current) return;
      leftSentRef.current = true;
      const payload: ReportPayload = {
        event: "left",
        sessionId: getSessionId(),
        client: collectClientInfo(),
        stage: stageRef.current,
        noAttempts: { ...attemptsRef.current },
        durationSec: durationSec(),
        round: roundRef.current,
      };
      beaconReport(payload);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") sendLeft();
    };
    window.addEventListener("pagehide", sendLeft);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", sendLeft);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [getSessionId]);

  const recordAttempt = useCallback((kind: NoAttemptKind) => {
    const stats = attemptsRef.current;
    stats[kind] += 1;
    stats.total += 1;
  }, []);

  /** Never rejects: a failed report must not block the flow. */
  const reportAccepted = useCallback(
    async (plan: DatePlan): Promise<void> => {
      acceptedRef.current = true;
      const payload: ReportPayload = {
        event: "accepted",
        sessionId: getSessionId(),
        client: collectClientInfo(),
        noAttempts: { ...attemptsRef.current },
        plan,
        durationSec: durationSec(),
        round: roundRef.current,
      };
      const ok = await postReport(payload);
      if (!ok) warnInDev();
    },
    [getSessionId],
  );

  /** "Replay": counters start over, the next answer is marked as a repeat. */
  const startNewRound = useCallback(() => {
    attemptsRef.current = emptyStats();
    roundRef.current += 1;
  }, []);

  return { recordAttempt, reportAccepted, startNewRound };
}
