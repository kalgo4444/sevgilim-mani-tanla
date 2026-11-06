import type { Point, Rect } from "@/shared/types";

export function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

export function toRect(domRect: DOMRect): Rect {
  return {
    left: domRect.left,
    top: domRect.top,
    width: domRect.width,
    height: domRect.height,
  };
}

export function inflateRect(rect: Rect, by: number): Rect {
  return {
    left: rect.left - by,
    top: rect.top - by,
    width: rect.width + by * 2,
    height: rect.height + by * 2,
  };
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.left < b.left + b.width &&
    a.left + a.width > b.left &&
    a.top < b.top + b.height &&
    a.top + a.height > b.top
  );
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Shortest distance from a point to the edge of a rect (0 when inside). */
export function distanceToRect(point: Point, rect: Rect): number {
  const dx = Math.max(
    rect.left - point.x,
    0,
    point.x - (rect.left + rect.width),
  );
  const dy = Math.max(
    rect.top - point.y,
    0,
    point.y - (rect.top + rect.height),
  );
  return Math.hypot(dx, dy);
}
