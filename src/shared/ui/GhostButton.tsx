"use client";

import { type HTMLMotionProps, motion } from "framer-motion";
import type { ReactNode } from "react";

interface GhostButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "type"> {
  icon: ReactNode;
  children: ReactNode;
}

/** Secondary pill button: soft white fill, rose icon. */
export function GhostButton({
  icon,
  children,
  className = "",
  ...rest
}: GhostButtonProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`inline-flex min-h-12 items-center gap-2.5 rounded-full border border-rose-soft/70 bg-white/80 px-6 py-3 text-[0.98rem] font-medium text-ink shadow-petal-sm transition-[background-color,box-shadow] hover:bg-white hover:shadow-petal sm:px-7 ${className}`}
      {...rest}
    >
      <span className="text-rose" aria-hidden="true">
        {icon}
      </span>
      {children}
    </motion.button>
  );
}
