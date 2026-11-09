"use client";

import { CalendarHeart } from "lucide-react";
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
      className="w-full max-w-[44rem] px-4 py-6 min-[400px]:px-5 sm:px-10 sm:py-10"
    >
      <header className="mb-7 sm:mb-8">
        {planner.badge && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-soft/40 bg-white/80 px-3.5 py-1 text-xs font-semibold text-rose-deep shadow-xs">
              <CalendarHeart
                className="size-3.5 text-rose"
                aria-hidden="true"
              />
              {planner.badge}
            </span>
          </div>
        )}
        <h1
          id="planner-heading"
          className="text-balance font-display text-[2rem] leading-tight font-medium text-ink sm:text-[2.6rem]"
        >
          {planner.title}
        </h1>
        <p className="mt-2 max-w-[48ch] text-sm sm:text-base text-ink-soft">
          {planner.subtitle}
        </p>
      </header>
      <DatePlanForm config={planner} onSubmit={onConfirm} />
    </GlassCard>
  );
}
