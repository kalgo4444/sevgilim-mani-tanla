export interface DatePlanLocation {
  /** A configured location id, or "custom" when she typed her own. */
  id: string;
  label: string;
  emoji: string;
  custom: boolean;
}

export interface DatePlan {
  location: DatePlanLocation;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM, 24-hour */
  time: string;
  note: string;
}

export const CUSTOM_LOCATION_ID = "custom";

export const DATE_PLAN_LIMITS = {
  customLocation: 100,
  note: 300,
} as const;
