"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarHeart,
  Check,
  Clock,
  Loader2,
  MapPin,
  PenLine,
  Sparkles,
} from "lucide-react";
import { type FormEvent, type ReactNode, useId, useState } from "react";
import {
  CUSTOM_LOCATION_ID,
  DATE_PLAN_LIMITS,
  type DatePlan,
} from "@/entities/date-plan";
import type { PlannerConfig } from "@/shared/config";
import { useDatePlanForm } from "../model/useDatePlanForm";

interface DatePlanFormProps {
  config: PlannerConfig;
  /** May return a promise; the button shows a loader until it settles. */
  onSubmit: (plan: DatePlan) => void | Promise<void>;
}

const fieldClass =
  "w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-base text-ink shadow-inner shadow-blush-100/60 outline-none transition-[border-color,box-shadow,background-color] placeholder:text-ink-soft/60 focus:border-rose-soft focus:bg-white focus:ring-4 focus:ring-rose-soft/30";

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          id={id}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-2 text-sm font-medium text-rose-deep"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function SectionTitle({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="mb-3 flex items-center gap-2.5 font-medium text-ink">
      <span
        className="flex size-7 sm:size-8 items-center justify-center rounded-xl border border-rose-soft/30 bg-blush-100/80 text-rose shadow-xs"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="font-semibold tracking-tight text-ink text-sm sm:text-base">
        {children}
      </span>
    </span>
  );
}

interface ChoiceCardProps {
  name: string;
  value: string;
  checked: boolean;
  onSelect: (value: string) => void;
  emoji: string;
  label: string;
}

function ChoiceCard({
  name,
  value,
  checked,
  onSelect,
  emoji,
  label,
}: ChoiceCardProps) {
  return (
    <label className="group relative block cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        className="peer sr-only"
      />
      <motion.span
        whileTap={{ scale: 0.96 }}
        animate={{ scale: checked ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="relative flex h-full min-h-[5.5rem] flex-col items-start justify-between gap-2 rounded-2xl border border-white/85 bg-white/60 p-3 text-left shadow-xs transition-all group-hover:bg-white/80 min-[400px]:p-3.5 group-hover:border-rose-soft/40 peer-checked:border-rose/50 peer-checked:bg-gradient-to-br peer-checked:from-blush-50 peer-checked:to-white peer-checked:shadow-petal-sm peer-focus-visible:ring-4 peer-focus-visible:ring-rose-soft/45"
      >
        <span
          className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-blush-100/70 text-2xl leading-none transition-transform group-hover:scale-105"
          aria-hidden="true"
        >
          {emoji}
        </span>
        <span className="text-[0.92rem] font-medium leading-snug text-ink sm:text-[0.95rem]">
          {label}
        </span>
      </motion.span>
      <AnimatePresence>
        {checked && (
          <motion.span
            aria-hidden="true"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 22 }}
            className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-rose text-cream shadow-xs"
          >
            <Check className="size-3 stroke-[3]" />
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}

export function DatePlanForm({ config, onSubmit }: DatePlanFormProps) {
  const form = useDatePlanForm(config);
  const [sending, setSending] = useState(false);
  const id = useId();
  const ids = {
    location: `${id}-location`,
    locationError: `${id}-location-error`,
    custom: `${id}-custom`,
    date: `${id}-date`,
    dateError: `${id}-date-error`,
    customTime: `${id}-time`,
    timeError: `${id}-time-error`,
    note: `${id}-note`,
    hint: `${id}-hint`,
  };
  const { values, errors } = form;
  const canSubmit = form.isValid && !sending;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const plan = form.buildPlan();
    if (!plan || sending) return;
    setSending(true);
    try {
      await onSubmit(plan);
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-6 sm:gap-7"
    >
      <fieldset>
        <legend className="contents">
          <SectionTitle icon={<MapPin className="size-[1.1rem]" />}>
            {config.locationLabel}
          </SectionTitle>
        </legend>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {config.locations.map((option) => (
            <ChoiceCard
              key={option.id}
              name={ids.location}
              value={option.id}
              checked={values.locationId === option.id}
              onSelect={form.setLocationId}
              emoji={option.emoji}
              label={option.label}
            />
          ))}
          {config.allowCustomLocation && (
            <ChoiceCard
              name={ids.location}
              value={CUSTOM_LOCATION_ID}
              checked={form.isCustom}
              onSelect={form.setLocationId}
              emoji={config.customLocationEmoji}
              label={config.customLocationLabel}
            />
          )}
        </div>
        <AnimatePresence initial={false}>
          {form.isCustom && (
            <motion.div
              key="custom"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="mt-3"
            >
              <label
                htmlFor={ids.custom}
                className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-soft"
              >
                <PenLine className="size-3.5" aria-hidden="true" />
                {config.customLocationInputLabel}
              </label>
              <div className="relative">
                <span
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-rose"
                  aria-hidden="true"
                >
                  <PenLine className="size-4" />
                </span>
                <input
                  id={ids.custom}
                  type="text"
                  // biome-ignore lint/a11y/noAutofocus: she just chose to type her own place.
                  autoFocus
                  autoComplete="off"
                  maxLength={DATE_PLAN_LIMITS.customLocation}
                  value={values.customLocation}
                  placeholder={config.customLocationPlaceholder}
                  onChange={(event) =>
                    form.setCustomLocation(event.target.value)
                  }
                  onBlur={form.markCustomTouched}
                  aria-invalid={Boolean(errors.location)}
                  aria-describedby={
                    errors.location ? ids.locationError : undefined
                  }
                  className={`${fieldClass} pl-10`}
                />
              </div>
              <FieldError id={ids.locationError} message={errors.location} />
            </motion.div>
          )}
        </AnimatePresence>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-5">
        <div>
          <label htmlFor={ids.date} className="block">
            <SectionTitle icon={<CalendarHeart className="size-[1.1rem]" />}>
              {config.dateLabel}
            </SectionTitle>
          </label>
          <div className="relative">
            <span
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-rose"
              aria-hidden="true"
            >
              <CalendarHeart className="size-4" />
            </span>
            <input
              id={ids.date}
              type="date"
              required
              min={form.today}
              value={values.date}
              onChange={(event) => form.setDate(event.target.value)}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? ids.dateError : undefined}
              className={`${fieldClass} date-field pl-10 font-medium`}
            />
          </div>
          <FieldError id={ids.dateError} message={errors.date} />
        </div>

        <fieldset>
          <legend className="contents">
            <SectionTitle icon={<Clock className="size-[1.1rem]" />}>
              {config.timeLabel}
            </SectionTitle>
          </legend>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {config.timeSlots.map((slot) => {
              const checked = values.time === slot;
              return (
                <label key={slot} className="cursor-pointer">
                  <input
                    type="radio"
                    name={`${id}-slot`}
                    value={slot}
                    checked={checked}
                    onChange={() => form.setTime(slot)}
                    className="peer sr-only"
                  />
                  <motion.span
                    whileTap={{ scale: 0.94 }}
                    className="inline-flex min-h-11 items-center rounded-full border border-white/80 bg-white/60 px-4 py-1.5 text-sm font-medium text-ink tabular-nums shadow-xs transition-all hover:bg-white hover:border-rose-soft/50 peer-checked:border-rose peer-checked:bg-gradient-to-r peer-checked:from-rose peer-checked:to-rose-deep peer-checked:text-cream peer-checked:shadow-petal-rose peer-focus-visible:ring-4 peer-focus-visible:ring-rose-soft/45"
                  >
                    {slot}
                  </motion.span>
                </label>
              );
            })}
          </div>
          <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
            <label
              htmlFor={ids.customTime}
              className="shrink-0 text-sm font-medium text-ink-soft"
            >
              {config.customTimeLabel}:
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rose"
                aria-hidden="true"
              >
                <Clock className="size-3.5" />
              </span>
              <input
                id={ids.customTime}
                type="time"
                required
                step={300}
                value={values.time}
                onChange={(event) => form.setTime(event.target.value)}
                aria-invalid={Boolean(errors.time)}
                aria-describedby={errors.time ? ids.timeError : undefined}
                className={`${fieldClass} date-field max-w-[9.5rem] py-2 pl-9 pr-3 font-medium tabular-nums`}
              />
            </div>
          </div>
          <FieldError id={ids.timeError} message={errors.time} />
        </fieldset>
      </div>

      <div>
        <label htmlFor={ids.note} className="block">
          <SectionTitle icon={<PenLine className="size-[1.1rem]" />}>
            {config.noteLabel}
          </SectionTitle>
        </label>
        <div className="relative">
          <textarea
            id={ids.note}
            rows={3}
            maxLength={DATE_PLAN_LIMITS.note}
            value={values.note}
            placeholder={config.notePlaceholder}
            onChange={(event) => form.setNote(event.target.value)}
            className={`${fieldClass} resize-none leading-relaxed pb-8`}
          />
          <div
            className="pointer-events-none absolute right-3 bottom-2.5 rounded-full border border-white/60 bg-blush-100/80 px-2.5 py-0.5 text-[0.7rem] font-semibold text-ink-soft/90 tabular-nums shadow-xs"
            aria-hidden="true"
          >
            {values.note.length}/{DATE_PLAN_LIMITS.note}
          </div>
        </div>
      </div>

      <div>
        <motion.button
          type="submit"
          disabled={!canSubmit}
          aria-describedby={!form.isValid ? ids.hint : undefined}
          whileHover={canSubmit ? { scale: 1.02 } : undefined}
          whileTap={canSubmit ? { scale: 0.97 } : undefined}
          className="flex min-h-13 w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-rose to-rose-deep px-6 py-3.5 text-[1.05rem] font-semibold text-cream shadow-petal-rose transition-all hover:shadow-[0_16px_36px_-10px_rgba(198,58,104,0.6)] disabled:cursor-not-allowed disabled:bg-none disabled:bg-rose-soft/70 disabled:text-cream/70 disabled:shadow-none"
        >
          {sending ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="size-5" aria-hidden="true" />
          )}
          {sending ? config.sendingLabel : config.submitLabel}
        </motion.button>
        <p
          id={ids.hint}
          aria-live="polite"
          className="mt-2.5 min-h-5 text-center text-sm font-medium text-ink-soft"
        >
          {!form.isValid && !errors.location && !errors.date && !errors.time
            ? form.firstError
            : ""}
        </p>
      </div>
    </form>
  );
}
