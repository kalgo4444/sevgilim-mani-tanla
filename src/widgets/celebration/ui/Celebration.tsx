"use client";

import { motion, type Variants } from "framer-motion";
import {
  CalendarHeart,
  Clock,
  HeartHandshake,
  MapPin,
  PenLine,
  RotateCcw,
  Sparkles,
} from "lucide-react";
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
  show: { transition: { staggerChildren: 0.25, delayChildren: 0.12 } },
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
    <div className="flex items-start gap-3.5 py-3.5">
      <span
        className="mt-0.5 flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-gradient-to-br from-blush-100 to-blush-200/60 text-rose shadow-xs"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft/75">
          {label}
        </dt>
        <dd className="mt-0.5 break-words text-[1rem] sm:text-[1.05rem] font-medium text-ink">
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
        {celebration.statusBadge && (
          <motion.div variants={item} className="mb-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-soft/40 bg-white/80 px-4 py-1.5 text-xs sm:text-sm font-semibold text-rose-deep shadow-petal-sm backdrop-blur-md">
              <Sparkles
                className="size-3.5 text-rose animate-spin [animation-duration:3s]"
                aria-hidden="true"
              />
              {celebration.statusBadge}
            </span>
          </motion.div>
        )}

        <motion.h1
          id="celebration-heading"
          variants={item}
          className="text-balance font-display text-[2.2rem] leading-[1.1] font-medium text-ink sm:text-[3.1rem]"
        >
          {celebration.title}
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-3.5 max-w-[32ch] text-balance text-base sm:text-lg text-ink-soft"
        >
          {celebration.subtitle}
        </motion.p>

        <motion.div variants={item} className="mt-8 w-full">
          <GlassCard className="px-5 py-5 text-left sm:px-8 sm:py-6">
            <div className="flex items-center justify-between border-b border-blush-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-lg bg-rose/10 text-rose">
                  <HeartHandshake className="size-4" />
                </span>
                <h2 className="font-display text-lg sm:text-xl italic font-semibold text-ink">
                  {celebration.planTitle}
                </h2>
              </div>
              <span className="rounded-full border border-rose-soft/30 bg-blush-50 px-2.5 py-0.5 text-xs font-semibold text-rose">
                Tayyor ❤️
              </span>
            </div>
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
                  <div className="mt-1 rounded-xl border border-blush-200/60 bg-blush-50/50 p-3 text-sm text-ink-soft leading-relaxed">
                    <span className="font-normal whitespace-pre-line">
                      {plan.note}
                    </span>
                  </div>
                </PlanRow>
              )}
            </dl>
          </GlassCard>
        </motion.div>

        <motion.p
          variants={item}
          className="mt-8 font-display text-[1.55rem] italic text-ink sm:text-[1.9rem]"
        >
          {celebration.closing}
        </motion.p>

        <motion.div variants={item} className="mt-8">
          <motion.button
            type="button"
            onClick={onReplay}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex min-h-12 items-center gap-2.5 rounded-full border border-rose-soft/70 bg-white/75 px-7 py-3 text-[0.98rem] font-medium text-ink shadow-petal-sm backdrop-blur-md transition-all hover:bg-white hover:shadow-petal"
          >
            <RotateCcw className="size-4 text-rose" aria-hidden="true" />
            {celebration.replayLabel}
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}
