import { clamp, distance, inflateRect, rectsOverlap } from "@/shared/lib";
import type { Point, Rect, Size } from "@/shared/types";

export interface SafePositionInput {
  viewport: Size;
  /** Size of the moving element. */
  size: Size;
  /** Current top-left corner, in viewport coordinates. */
  current: Point;
  /** Areas the element must not cover. */
  obstacles: readonly Rect[];
  /** Distance kept from the viewport edges. */
  padding: number;
  /** Extra space kept around each obstacle. */
  gap: number;
  /** Smallest jump that still feels playful. Use 0 to only fix an invalid spot. */
  minJump: number;
  maxAttempts?: number;
  random?: () => number;
}

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function getBounds({ viewport, size, padding }: SafePositionInput): Bounds {
  const minX = padding;
  const minY = padding;
  return {
    minX,
    minY,
    maxX: Math.max(minX, viewport.width - padding - size.width),
    maxY: Math.max(minY, viewport.height - padding - size.height),
  };
}

function overlapsAny(
  point: Point,
  size: Size,
  obstacles: readonly Rect[],
): boolean {
  const rect: Rect = {
    left: point.x,
    top: point.y,
    width: size.width,
    height: size.height,
  };
  return obstacles.some((obstacle) => rectsOverlap(rect, obstacle));
}

/** True if the element at `point` is inside the viewport and clear of every obstacle. */
export function isPositionSafe(
  point: Point,
  input: SafePositionInput,
): boolean {
  const bounds = getBounds(input);
  const inside =
    point.x >= bounds.minX - 0.5 &&
    point.x <= bounds.maxX + 0.5 &&
    point.y >= bounds.minY - 0.5 &&
    point.y <= bounds.maxY + 0.5;
  const obstacles = input.obstacles.map((o) => inflateRect(o, input.gap));
  return inside && !overlapsAny(point, input.size, obstacles);
}

/**
 * Picks a new top-left corner for the escaping button: inside the viewport,
 * clear of the obstacles, and far enough from where it was. Tries random
 * spots first, then a grid, then the clamped current spot.
 */
export function findSafePosition(input: SafePositionInput): Point {
  const { current, size, maxAttempts = 40, random = Math.random } = input;
  const bounds = getBounds(input);
  const obstacles = input.obstacles.map((o) => inflateRect(o, input.gap));
  const spanX = bounds.maxX - bounds.minX;
  const spanY = bounds.maxY - bounds.minY;
  // On a tiny screen a big jump may be impossible, so cap it.
  const minJump = Math.min(input.minJump, Math.hypot(spanX, spanY) * 0.45);

  for (let i = 0; i < maxAttempts; i += 1) {
    const candidate = {
      x: bounds.minX + random() * spanX,
      y: bounds.minY + random() * spanY,
    };
    if (
      distance(candidate, current) >= minJump &&
      !overlapsAny(candidate, size, obstacles)
    ) {
      return candidate;
    }
  }

  // Fallback: scan a grid and take the free spot farthest from the current one.
  const steps = 6;
  let best: Point | null = null;
  let bestDistance = -1;
  for (let ix = 0; ix <= steps; ix += 1) {
    for (let iy = 0; iy <= steps; iy += 1) {
      const candidate = {
        x: bounds.minX + (spanX * ix) / steps,
        y: bounds.minY + (spanY * iy) / steps,
      };
      if (overlapsAny(candidate, size, obstacles)) continue;
      const d = distance(candidate, current);
      if (d > bestDistance) {
        best = candidate;
        bestDistance = d;
      }
    }
  }
  if (best) return best;

  return {
    x: clamp(current.x, bounds.minX, bounds.maxX),
    y: clamp(current.y, bounds.minY, bounds.maxY),
  };
}
