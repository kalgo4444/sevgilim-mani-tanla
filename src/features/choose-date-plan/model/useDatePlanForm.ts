import { useState } from "react";
import {
  CUSTOM_LOCATION_ID,
  DATE_PLAN_LIMITS,
  type DatePlan,
} from "@/entities/date-plan";
import type { PlannerConfig } from "@/shared/config";
import {
  isValidIsoDate,
  isValidTime,
  toIsoDate,
  toTimeString,
} from "@/shared/lib";

export interface DatePlanErrors {
  location?: string;
  date?: string;
  time?: string;
}

function tomorrowIso(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toIsoDate(date);
}

/** Config date if it is still ahead (or today), otherwise tomorrow. */
function initialDate(configDate: string, today: string): string {
  return isValidIsoDate(configDate) && configDate >= today
    ? configDate
    : tomorrowIso();
}

/**
 * Form state for the planner. Mount it only in the browser: it reads the
 * current date (the planner screen is never server-rendered).
 */
export function useDatePlanForm(config: PlannerConfig) {
  const [today] = useState(() => toIsoDate(new Date()));
  const [locationId, setLocationId] = useState<string | null>(null);
  const [customLocation, setCustomLocationRaw] = useState("");
  const [customTouched, setCustomTouched] = useState(false);
  const [date, setDate] = useState(() =>
    initialDate(config.defaultDate, today),
  );
  const [time, setTime] = useState(
    isValidTime(config.defaultTime) ? config.defaultTime : "",
  );
  const [note, setNoteRaw] = useState("");

  const isCustom = locationId === CUSTOM_LOCATION_ID;
  const errors: DatePlanErrors = {};

  if (!locationId) errors.location = config.errors.location;
  else if (isCustom && customLocation.trim() === "")
    errors.location = config.errors.customLocation;

  if (!isValidIsoDate(date)) errors.date = config.errors.date;
  else if (date < today) errors.date = config.errors.datePast;

  if (!isValidTime(time)) errors.time = config.errors.time;
  else if (date === today && time <= toTimeString(new Date()))
    errors.time = config.errors.timePast;

  const isValid = !errors.location && !errors.date && !errors.time;

  /** Errors worth showing next to a field right now. */
  const visibleErrors: DatePlanErrors = {
    location: isCustom && customTouched ? errors.location : undefined,
    date: errors.date,
    time: errors.time,
  };

  const firstError = errors.location ?? errors.date ?? errors.time;

  const setCustomLocation = (value: string) => {
    setCustomLocationRaw(value.slice(0, DATE_PLAN_LIMITS.customLocation));
  };
  const setNote = (value: string) =>
    setNoteRaw(value.slice(0, DATE_PLAN_LIMITS.note));

  const buildPlan = (): DatePlan | null => {
    if (!isValid || !locationId) return null;
    const option = config.locations.find((item) => item.id === locationId);
    const location = isCustom
      ? {
          id: CUSTOM_LOCATION_ID,
          label: customLocation.trim(),
          emoji: config.customLocationEmoji,
          custom: true,
        }
      : option
        ? {
            id: option.id,
            label: option.label,
            emoji: option.emoji,
            custom: false,
          }
        : null;
    if (!location) return null;
    return { location, date, time, note: note.trim() };
  };

  return {
    today,
    values: { locationId, customLocation, date, time, note },
    isCustom,
    setLocationId,
    setCustomLocation,
    markCustomTouched: () => setCustomTouched(true),
    setDate,
    setTime,
    setNote,
    errors: visibleErrors,
    firstError,
    isValid,
    buildPlan,
  };
}
