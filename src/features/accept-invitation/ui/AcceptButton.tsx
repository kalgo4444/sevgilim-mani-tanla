"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Ref } from "react";

interface AcceptButtonProps {
  label: string;
  onAccept: () => void;
  ref?: Ref<HTMLButtonElement>;
  className?: string;
}

/** The "Yes" button: always clickable, with a soft idle heartbeat. */
export function AcceptButton({
  label,
  onAccept,
  ref,
  className = "",
}: AcceptButtonProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onAccept}
      animate={reduceMotion ? undefined : { scale: [1, 1.06, 1, 1.035, 1] }}
      transition={{
        duration: 1.3,
        times: [0, 0.18, 0.36, 0.52, 1],
        repeat: Number.POSITIVE_INFINITY,
        repeatDelay: 0.9,
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className={`relative z-20 inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full bg-rose px-7 py-3 font-semibold text-cream shadow-petal-rose ${className}`}
    >
      {label}
    </motion.button>
  );
}
