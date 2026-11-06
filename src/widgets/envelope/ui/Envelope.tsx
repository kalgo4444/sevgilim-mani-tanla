"use client";

import { motion, useAnimate, useReducedMotion } from "framer-motion";
import { MailOpen } from "lucide-react";
import { useRef } from "react";
import { invitationConfig } from "@/shared/config";
import { HeartShape } from "@/shared/ui";

interface EnvelopeProps {
  /** Called once the opening animation has finished. */
  onOpened: () => void;
}

const EASE_FOLD = [0.65, 0, 0.35, 1] as const;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function setZ(root: HTMLElement | null, selector: string, z: number) {
  const el = root?.querySelector<HTMLElement>(selector);
  if (el) el.style.zIndex = String(z);
}

export function Envelope({ onOpened }: EnvelopeProps) {
  const { envelope } = invitationConfig;
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const reduceMotion = useReducedMotion();
  const openingRef = useRef(false);

  const open = async () => {
    if (openingRef.current) return;
    openingRef.current = true;
    const root = scope.current;

    animate("[data-chrome]", { opacity: 0 }, { duration: 0.3 });

    if (reduceMotion) {
      // Fades only: no 3D flip, no sliding.
      await animate("[data-seal]", { opacity: 0 }, { duration: 0.2 });
      await animate("[data-flap]", { opacity: 0 }, { duration: 0.25 });
      setZ(root, "[data-letter]", 40);
      await animate("[data-body]", { opacity: 0 }, { duration: 0.3 });
      onOpened();
      return;
    }

    // 1. The seal pops.
    await animate(
      "[data-seal]",
      { scale: [1, 1.22, 0], opacity: [1, 1, 0] },
      { duration: 0.42, ease: "easeIn" },
    );
    // 2. The flap folds open around its top edge.
    await animate(
      "[data-flap]",
      { rotateX: 180 },
      { duration: 0.75, ease: EASE_FOLD },
    );
    // Past 90° the flap belongs behind the letter.
    setZ(root, "[data-flap]", 5);
    // 3. The letter slides up.
    await animate(
      "[data-letter]",
      { y: "-58%" },
      { duration: 0.8, ease: EASE_OUT },
    );
    // 4. The letter comes forward and grows while the envelope fades.
    setZ(root, "[data-letter]", 40);
    animate("[data-body]", { opacity: 0 }, { duration: 0.45 });
    await animate(
      "[data-letter]",
      { y: "-20%", scale: 1.45, opacity: [1, 1, 0] },
      { duration: 0.7, ease: EASE_OUT },
    );
    onOpened();
  };

  return (
    <div ref={scope} className="flex w-full flex-col items-center gap-10">
      <p
        data-chrome
        className="max-w-[18ch] text-balance text-center font-display text-[1.75rem] italic leading-snug text-ink sm:text-[2.1rem]"
      >
        {envelope.teaser}
      </p>

      <button
        type="button"
        onClick={open}
        aria-label={envelope.openLabel}
        className="group relative block aspect-[10/7] w-[min(86vw,23rem)] cursor-pointer rounded-2xl"
        style={{ perspective: 1100 }}
      >
        {/* Inside of the envelope */}
        <span
          data-body
          aria-hidden="true"
          className="envelope-back absolute inset-0 z-0 rounded-2xl shadow-petal"
        />

        {/* The letter */}
        <span
          data-letter
          aria-hidden="true"
          className="absolute inset-x-[7%] top-[7%] bottom-[5%] z-10 flex flex-col items-center justify-start gap-2 rounded-xl bg-paper px-4 pt-[9%] shadow-petal-sm"
        >
          <HeartShape className="size-6 text-rose" />
          <span className="font-display text-lg italic text-ink">
            {envelope.letterHint}
          </span>
          <span className="mt-1 h-px w-2/3 bg-blush-200" />
          <span className="h-px w-1/2 bg-blush-200" />
        </span>

        {/* Front pocket: three paper folds */}
        <span data-body aria-hidden="true" className="absolute inset-0 z-20">
          <span className="envelope-fold-left absolute inset-0 rounded-2xl" />
          <span className="envelope-fold-right absolute inset-0 rounded-2xl" />
          <span className="envelope-fold-bottom absolute inset-0 rounded-2xl" />
        </span>

        {/* The flap, with an outer and an inner face */}
        <span
          data-flap
          data-body
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-30 h-[56%]"
          style={{ transformOrigin: "50% 0%", transformStyle: "preserve-3d" }}
        >
          <span
            className="envelope-flap-outer absolute inset-0"
            style={{ backfaceVisibility: "hidden" }}
          />
          <span
            className="envelope-flap-inner absolute inset-0"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateX(180deg)",
            }}
          />
        </span>

        {/* Wax seal on the tip of the flap */}
        <span
          data-seal
          aria-hidden="true"
          className="absolute top-[56%] left-1/2 z-40 -mt-8 -ml-8 block size-16"
        >
          <motion.span
            className="wax-seal flex size-full items-center justify-center rounded-full"
            animate={reduceMotion ? undefined : { scale: [1, 1.1, 1, 1.06, 1] }}
            transition={{
              duration: 1.2,
              times: [0, 0.15, 0.3, 0.45, 1],
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 0.8,
            }}
          >
            <HeartShape className="size-7 text-cream/85" />
          </motion.span>
        </span>
      </button>

      <motion.button
        data-chrome
        type="button"
        onClick={open}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="inline-flex min-h-12 items-center gap-2.5 rounded-full border border-rose-soft/70 bg-white/65 px-6 py-3 font-medium text-ink shadow-petal-sm backdrop-blur-md"
      >
        <MailOpen className="size-[1.15rem] text-rose" aria-hidden="true" />
        {envelope.openLabel}
      </motion.button>
    </div>
  );
}
