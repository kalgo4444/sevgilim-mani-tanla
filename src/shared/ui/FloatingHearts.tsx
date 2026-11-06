"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
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
  const count = window.innerWidth < 640 ? 7 : 14;
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
  const reduceMotion = useReducedMotion();
  const [hearts] = useState(makeHearts);

  if (reduceMotion) {
    return hearts.slice(0, 6).map((heart) => (
      <span
        key={heart.id}
        className="absolute text-rose-soft"
        style={{
          left: `${heart.left}%`,
          top: `${heart.top}%`,
          width: heart.size,
          height: heart.size,
          opacity: heart.opacity * 0.6,
        }}
      >
        <HeartShape filled={heart.filled} className="block size-full" />
      </span>
    ));
  }

  return hearts.map((heart) => (
    <motion.span
      key={heart.id}
      className="absolute top-full text-rose-soft will-change-transform"
      style={{ left: `${heart.left}%`, width: heart.size, height: heart.size }}
      initial={{ y: 0, x: 0, opacity: 0 }}
      animate={{
        y: "-115vh",
        x: [0, heart.sway, -heart.sway, 0],
        opacity: [0, heart.opacity, heart.opacity, 0],
      }}
      transition={{
        duration: heart.duration,
        delay: heart.delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
        x: {
          duration: heart.duration,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: heart.delay,
        },
      }}
    >
      <HeartShape filled={heart.filled} className="block size-full" />
    </motion.span>
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
