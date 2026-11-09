"use client";

import { motion } from "framer-motion";
import {
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { distanceToRect, toRect } from "@/shared/lib";
import { useEscapePosition } from "../model/useEscapePosition";

export type EscapeAttemptKind = "hover" | "tap" | "focus";

interface EscapeButtonProps {
  label: string;
  /** Optional labels shown one after another after each escape. */
  teasers?: readonly string[];
  /** Elements the button must never cover (Yes button, heading, question). */
  avoidRefs: readonly RefObject<HTMLElement | null>[];
  onAttempt: (kind: EscapeAttemptKind) => void;
  className?: string;
}

/** How close the mouse may get before the button runs. */
const PROXIMITY_PX = 56;
/** One approach counts once. */
const HOVER_THROTTLE_MS = 400;
/** A click or focus right after pointerdown is the same attempt. */
const SAME_GESTURE_MS = 700;

export function EscapeButton({
  label,
  teasers = [],
  avoidRefs,
  onAttempt,
  className = "",
}: EscapeButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastHoverAt = useRef(0);
  const lastPointerDownAt = useRef(0);
  const [escapes, setEscapes] = useState(0);
  const { x, y, opacity, jumpAway, ensureSafe } = useEscapePosition({
    buttonRef,
    avoidRefs,
  });

  const text =
    escapes === 0 || teasers.length === 0
      ? label
      : (teasers[(escapes - 1) % teasers.length] ?? label);

  const run = (kind: EscapeAttemptKind) => {
    jumpAway();
    setEscapes((count) => count + 1);
    onAttempt(kind);
  };

  const runFromHover = () => {
    const now = performance.now();
    if (now - lastHoverAt.current < HOVER_THROTTLE_MS) return;
    lastHoverAt.current = now;
    run("hover");
  };

  // A new label can change the width: keep the button inside the screen.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-check whenever the text changes.
  useLayoutEffect(() => {
    ensureSafe();
  }, [text, ensureSafe]);

  // Desktop: run when the mouse gets close, not only on hover.
  useEffect(() => {
    const onPointerMove = (event: globalThis.PointerEvent) => {
      if (event.pointerType === "touch") return;
      const button = buttonRef.current;
      if (!button) return;
      const rect = toRect(button.getBoundingClientRect());
      if (
        distanceToRect({ x: event.clientX, y: event.clientY }, rect) <=
        PROXIMITY_PX
      )
        runFromHover();
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  });

  // Touch: stop the tap from turning into a click. Needs a non-passive listener.
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    const onTouchStart = (event: TouchEvent) => event.preventDefault();
    button.addEventListener("touchstart", onTouchStart, { passive: false });
    return () => button.removeEventListener("touchstart", onTouchStart);
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    lastPointerDownAt.current = performance.now();
    run("tap");
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    // Keyboard Enter/Space arrive here without a pointerdown first.
    if (performance.now() - lastPointerDownAt.current > SAME_GESTURE_MS)
      run("tap");
  };

  const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
    if (performance.now() - lastPointerDownAt.current < SAME_GESTURE_MS) return;
    if (!event.currentTarget.matches(":focus-visible")) return;
    run("focus");
  };

  const shape =
    "inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full border px-6 py-3.5 text-base font-medium sm:px-8";

  return (
    // The slot keeps the first label's size, so a longer teaser never
    // re-flows the row (which would also shift the Yes button).
    <span className={`relative inline-block ${className}`}>
      <span
        aria-hidden="true"
        className={`${shape} invisible border-transparent`}
      >
        {label}
      </span>
      <motion.button
        ref={buttonRef}
        type="button"
        style={{ x, y, opacity }}
        onPointerEnter={(event) => {
          if (event.pointerType !== "touch") runFromHover();
        }}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onFocus={handleFocus}
        className={`${shape} absolute top-0 left-0 z-30 touch-none select-none border-rose-soft/60 bg-white/80 text-ink shadow-petal-sm transition-colors hover:bg-white/90 will-change-transform`}
      >
        {text}
      </motion.button>
    </span>
  );
}
