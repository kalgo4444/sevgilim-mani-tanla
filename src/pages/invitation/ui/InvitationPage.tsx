"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useState } from "react";
import type { DatePlan } from "@/entities/date-plan";
import { useTelegramReport } from "@/features/telegram-report";
import { FloatingHearts } from "@/shared/ui";
import { Celebration } from "@/widgets/celebration";
import { DatePlanner } from "@/widgets/date-planner";
import { Envelope } from "@/widgets/envelope";
import { InvitationCard } from "@/widgets/invitation-card";
import type { Stage } from "../model/stage";

interface StageFrameProps {
  children: ReactNode;
}

function StageFrame({ children }: StageFrameProps) {
  return (
    <motion.div
      className="relative z-10 flex min-h-dvh w-full items-center justify-center px-3.5 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
      }}
      exit={{
        opacity: 0,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeIn" },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Holds the stage state machine and wires the screens to the reports. */
export function InvitationPage() {
  const [stage, setStage] = useState<Stage>("envelope");
  const [plan, setPlan] = useState<DatePlan | null>(null);
  const [round, setRound] = useState(1);
  const report = useTelegramReport(stage);

  const handleConfirm = async (chosen: DatePlan) => {
    // Never throws; the flow continues whether or not Telegram got it.
    await report.reportAccepted(chosen);
    setPlan(chosen);
    setStage("celebration");
  };

  const handleReplay = () => {
    report.startNewRound();
    setPlan(null);
    setRound((value) => value + 1);
    setStage("envelope");
  };

  return (
    <main className="relative min-h-dvh overflow-x-clip">
      <FloatingHearts />
      <AnimatePresence
        mode="wait"
        onExitComplete={() => window.scrollTo({ top: 0 })}
      >
        {stage === "envelope" && (
          <StageFrame key={`envelope-${round}`}>
            <Envelope onOpened={() => setStage("invitation")} />
          </StageFrame>
        )}
        {stage === "invitation" && (
          <StageFrame key={`invitation-${round}`}>
            <InvitationCard
              onAccept={() => setStage("planner")}
              onNoAttempt={report.recordAttempt}
            />
          </StageFrame>
        )}
        {stage === "planner" && (
          <StageFrame key={`planner-${round}`}>
            <DatePlanner onConfirm={handleConfirm} />
          </StageFrame>
        )}
        {stage === "celebration" && plan && (
          <StageFrame key={`celebration-${round}`}>
            <Celebration plan={plan} onReplay={handleReplay} />
          </StageFrame>
        )}
      </AnimatePresence>
    </main>
  );
}
