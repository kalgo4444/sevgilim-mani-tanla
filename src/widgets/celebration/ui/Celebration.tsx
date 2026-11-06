"use client";

import { motion, type Variants } from "framer-motion";
import { CalendarHeart, Clock, MapPin, PenLine, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import type { DatePlan } from "@/entities/date-plan";
import { invitationConfig } from "@/shared/config";
import { formatPlanDate } from "@/shared/lib";
import { Confetti, GlassCard } from "@/shared/ui";

interface CelebrationProps {
  plan: DatePlan;
  onReplay: () => void;
}

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.28, delayChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

interface PlanRowProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}

function PlanRow({ icon, label, children }: PlanRowProps) {
  return (
    <div className="flex items-start gap-3.5 py-3">
      <span
        className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-blush-100 text-rose"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-sm text-ink-soft">{label}</dt>
        <dd className="mt-0.5 break-words text-[1.05rem] font-medium text-ink">
          {children}
        </dd>
      </div>
    </div>
  );
}

export function Celebration({ plan, onReplay }: CelebrationProps) {
  const { celebration } = invitationConfig;
  return (
    <section
      aria-labelledby="celebration-heading"
      className="flex w-full max-w-[36rem] flex-col items-center"
    >
      <Confetti />
      <motion.div
        variants={list}
        initial="hidden"
        animate="show"
        className="flex w-full flex-col items-center text-center"
      >
        <motion.h1
          id="celebration-heading"
          variants={item}
          className="text-balance font-display text-[2.3rem] leading-[1.1] font-medium text-ink sm:text-[3.1rem]"
        >
          {celebration.title}
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-4 max-w-[32ch] text-balance text-lg text-ink-soft"
        >
          {celebration.subtitle}
        </motion.p>

        <motion.div variants={item} className="mt-9 w-full">
          <GlassCard className="px-6 py-5 text-left sm:px-8">
            <h2 className="font-display text-xl italic text-ink-soft">
              {celebration.planTitle}
            </h2>
            <dl className="mt-2 divide-y divide-blush-100">
              <PlanRow
                icon={<MapPin className="size-[1.1rem]" />}
                label={celebration.placeLabel}
              >
                <span aria-hidden="true">{plan.location.emoji} </span>
                {plan.location.label}
              </PlanRow>
              <PlanRow
                icon={<CalendarHeart className="size-[1.1rem]" />}
                label={celebration.dateLabel}
              >
                {formatPlanDate(plan.date)}
              </PlanRow>
              <PlanRow
                icon={<Clock className="size-[1.1rem]" />}
                label={celebration.timeLabel}
              >
                <span className="tabular-nums">{plan.time}</span>
              </PlanRow>
              {plan.note && (
                <PlanRow
                  icon={<PenLine className="size-[1.1rem]" />}
                  label={celebration.noteLabel}
                >
                  <span className="font-normal whitespace-pre-line">
                    {plan.note}
                  </span>
                </PlanRow>
              )}
            </dl>
          </GlassCard>
        </motion.div>

        <motion.p
          variants={item}
          className="mt-9 font-display text-[1.6rem] italic text-ink sm:text-[1.9rem]"
        >
          {celebration.closing}
        </motion.p>

        <motion.div variants={item} className="mt-8">
          <motion.button
            type="button"
            onClick={onReplay}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex min-h-12 items-center gap-2.5 rounded-full border border-rose-soft/70 bg-white/65 px-6 py-3 font-medium text-ink shadow-petal-sm backdrop-blur-md"
          >
            <RotateCcw className="size-4 text-rose" aria-hidden="true" />
            {celebration.replayLabel}
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}
