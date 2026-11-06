// Server-safe helpers only. React hooks (useIsClient) are imported from their own file.
export { escapeHtml } from "./escapeHtml";
export {
  formatDateTime,
  formatDuration,
  formatPlanDate,
  isValidIsoDate,
  isValidTime,
  parseIsoDate,
  toIsoDate,
  toTimeString,
} from "./formatDateTime";
export {
  clamp,
  distance,
  distanceToRect,
  inflateRect,
  rectsOverlap,
  toRect,
} from "./geometry";
export { createId, randomBetween, randomItem } from "./random";
