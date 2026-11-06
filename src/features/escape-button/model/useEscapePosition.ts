import {
  type AnimationPlaybackControls,
  animate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { type RefObject, useCallback, useEffect, useRef } from "react";
import { toRect } from "@/shared/lib";
import type { Point, Rect } from "@/shared/types";
import {
  findSafePosition,
  isPositionSafe,
  type SafePositionInput,
} from "../lib/findSafePosition";

const EDGE_PADDING = 16;
const OBSTACLE_GAP = 14;
const MIN_JUMP = 170;

interface UseEscapePositionOptions {
  buttonRef: RefObject<HTMLElement | null>;
  avoidRefs: readonly RefObject<HTMLElement | null>[];
}

/**
 * Moves an element around the viewport with x/y transforms. Its layout spot
 * never changes; only the offset does.
 */
export function useEscapePosition({
  buttonRef,
  avoidRefs,
}: UseEscapePositionOptions) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(1);
  const reduceMotion = useReducedMotion();
  const controlsRef = useRef<AnimationPlaybackControls[]>([]);

  /** Where the current animation is heading, as an offset from the layout spot. */
  const targetOffsetRef = useRef<Point>({ x: 0, y: 0 });

  /**
   * Measures the button. `origin` is its layout spot (no transform) and
   * `current` is where it is heading, not where the spring is right now.
   */
  const measure = useCallback(
    (minJump: number): { input: SafePositionInput; origin: Point } | null => {
      const button = buttonRef.current;
      if (!button) return null;
      const rect = button.getBoundingClientRect();
      const origin = { x: rect.left - x.get(), y: rect.top - y.get() };
      const obstacles: Rect[] = [];
      for (const ref of avoidRefs) {
        if (ref.current) {
          obstacles.push(toRect(ref.current.getBoundingClientRect()));
        }
      }
      const input: SafePositionInput = {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        size: { width: rect.width, height: rect.height },
        current: {
          x: origin.x + targetOffsetRef.current.x,
          y: origin.y + targetOffsetRef.current.y,
        },
        obstacles,
        padding: EDGE_PADDING,
        gap: OBSTACLE_GAP,
        minJump,
      };
      return { input, origin };
    },
    [buttonRef, avoidRefs, x, y],
  );

  const moveTo = useCallback(
    (target: Point, origin: Point, instant: boolean) => {
      for (const control of controlsRef.current) control.stop();
      const toX = target.x - origin.x;
      const toY = target.y - origin.y;
      targetOffsetRef.current = { x: toX, y: toY };

      if (instant) {
        x.set(toX);
        y.set(toY);
        return;
      }
      if (reduceMotion) {
        // A short fade instead of a jump.
        const fadeOut = animate(opacity, 0, { duration: 0.12 });
        controlsRef.current = [fadeOut];
        fadeOut.then(() => {
          x.set(toX);
          y.set(toY);
          controlsRef.current = [animate(opacity, 1, { duration: 0.18 })];
        });
        return;
      }
      const spring = {
        type: "spring",
        stiffness: 420,
        damping: 24,
        mass: 0.7,
      } as const;
      controlsRef.current = [animate(x, toX, spring), animate(y, toY, spring)];
    },
    [opacity, reduceMotion, x, y],
  );

  /** Jump to a new safe spot. */
  const jumpAway = useCallback(() => {
    const measured = measure(MIN_JUMP);
    if (!measured) return;
    moveTo(findSafePosition(measured.input), measured.origin, false);
  }, [measure, moveTo]);

  /**
   * Fix the target only if it is no longer safe (new label width, resize).
   * `instant` skips the animation, e.g. while the window is resizing.
   */
  const ensureSafe = useCallback(
    (instant = false) => {
      const { x: offsetX, y: offsetY } = targetOffsetRef.current;
      if (offsetX === 0 && offsetY === 0) return;
      const measured = measure(0);
      if (!measured || isPositionSafe(measured.input.current, measured.input)) {
        return;
      }
      moveTo(findSafePosition(measured.input), measured.origin, instant);
    },
    [measure, moveTo],
  );

  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => ensureSafe(true));
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [ensureSafe]);

  useEffect(() => {
    const controls = controlsRef;
    return () => {
      for (const control of controls.current) control.stop();
    };
  }, []);

  return { x, y, opacity, jumpAway, ensureSafe };
}
