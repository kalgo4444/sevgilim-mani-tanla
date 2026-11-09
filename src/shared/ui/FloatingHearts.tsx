"use client";

import { type CSSProperties, useState } from "react";
import { randomBetween } from "@/shared/lib";
import { useIsClient } from "@/shared/lib/useIsClient";
import { HeartShape } from "./HeartShape";

interface FloatingHeart {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  sway: number;
  opacity: number;
  top: number;
  filled: boolean;
}

function makeHearts(): FloatingHeart[] {
  const count = window.innerWidth < 640 ? 6 : 12;
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: randomBetween(2, 96),
    size: randomBetween(12, 30),
    duration: randomBetween(14, 26),
    delay: randomBetween(0, 14),
    sway: randomBetween(10, 28),
    opacity: randomBetween(0.35, 0.7),
    top: randomBetween(5, 92),
    filled: Math.random() > 0.45,
  }));
}

function HeartsLayer() {
  const [hearts] = useState(makeHearts);

  // With reduced motion the hearts stop: a few stay put, dimmer, at fixed heights.
  return hearts.map((heart) => (
    <span
      key={heart.id}
      className={`floating-heart absolute top-full text-rose-soft motion-reduce:top-(--heart-top) motion-reduce:animate-none motion-reduce:opacity-(--heart-still) ${heart.id >= 6 ? "motion-reduce:hidden" : ""}`}
      style={
        {
          left: `${heart.left}%`,
          width: heart.size,
          height: heart.size,
          "--heart-opacity": heart.opacity,
          "--heart-still": heart.opacity * 0.6,
          "--heart-top": `${heart.top}%`,
          "--heart-sway": `${heart.sway}px`,
          "--heart-duration": `${heart.duration}s`,
          "--heart-delay": `${heart.delay}s`,
        } as CSSProperties
      }
    >
      <HeartShape filled={heart.filled} className="block size-full" />
    </span>
  ));
}

/** Hearts drifting up behind the content. Rendered only after mount. */
export function FloatingHearts() {
  const isClient = useIsClient();
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {isClient && <HeartsLayer />}
    </div>
  );
}
