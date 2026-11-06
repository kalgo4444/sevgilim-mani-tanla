"use client";

import type { DatePlan } from "@/entities/date-plan";
import { DatePlanForm } from "@/features/choose-date-plan";
import { invitationConfig } from "@/shared/config";
import { GlassCard } from "@/shared/ui";

interface DatePlannerProps {
  /** May return a promise; the submit button shows a loader until it settles. */
  onConfirm: (plan: DatePlan) => void | Promise<void>;
}

export function DatePlanner({ onConfirm }: DatePlannerProps) {
  const { planner } = invitationConfig;
  return (
    <GlassCard
      as="section"
      aria-labelledby="planner-heading"
      className="w-full max-w-[42rem] px-5 py-8 sm:px-10 sm:py-10"
    >
      <header className="mb-8">
        <h1
          id="planner-heading"
          className="text-balance font-display text-[2rem] leading-tight font-medium text-ink sm:text-[2.5rem]"
        >
          {planner.title}
        </h1>
        <p className="mt-2 max-w-[48ch] text-ink-soft">{planner.subtitle}</p>
      </header>
      <DatePlanForm config={planner} onSubmit={onConfirm} />
    </GlassCard>
  );
}
