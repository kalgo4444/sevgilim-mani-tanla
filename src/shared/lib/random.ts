/** Random float in [min, max). */
export function randomBetween(
  min: number,
  max: number,
  random: () => number = Math.random,
): number {
  return min + random() * (max - min);
}

export function randomItem<T>(
  items: readonly T[],
  random: () => number = Math.random,
): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(random() * items.length)];
}

/**
 * A random id. Uses crypto.randomUUID when available. It is missing on plain
 * http pages (e.g. a phone opening the dev server by LAN IP), so fall back to
 * getRandomValues. Call only in the browser after mount.
 */
export function createId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
