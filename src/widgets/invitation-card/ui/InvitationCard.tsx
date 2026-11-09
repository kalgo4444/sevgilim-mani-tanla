"use client";

import { useRef } from "react";
import { AcceptButton } from "@/features/accept-invitation";
import { type EscapeAttemptKind, EscapeButton } from "@/features/escape-button";
import { getGreeting, invitationConfig } from "@/shared/config";
import { GlassCard, HeartShape } from "@/shared/ui";

interface InvitationCardProps {
  onAccept: () => void;
  onNoAttempt: (kind: EscapeAttemptKind) => void;
}

export function InvitationCard({ onAccept, onNoAttempt }: InvitationCardProps) {
  const { invitation, buttons } = invitationConfig;
  const yesRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const questionRef = useRef<HTMLParagraphElement>(null);
  const avoidRefs = [yesRef, headingRef, questionRef];

  return (
    <GlassCard
      as="section"
      aria-labelledby="invitation-heading"
      className="w-full max-w-[34rem] px-5 pt-12 pb-9 text-center min-[400px]:px-6 sm:px-12 sm:pt-14 sm:pb-12"
    >
      <div
        aria-hidden="true"
        className="absolute -top-7 left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white/90 bg-gradient-to-b from-white via-blush-50 to-blush-100 shadow-petal ring-4 ring-blush-100/50 text-rose"
      >
        <HeartShape className="size-7 text-rose drop-shadow-xs" />
      </div>
      <h1 id="invitation-heading" ref={headingRef} className="mx-auto w-fit">
        <span className="inline-block rounded-full border border-rose-soft/30 bg-blush-50/70 px-4 py-1 font-display text-[1.15rem] italic text-rose-deep sm:text-[1.35rem]">
          {getGreeting()}
        </span>
      </h1>
      <p
        ref={questionRef}
        className="mx-auto mt-5 w-fit max-w-[14ch] text-balance font-display text-[2.15rem] leading-[1.12] font-medium tracking-[-0.01em] text-ink min-[400px]:text-[2.45rem] sm:text-[3.25rem]"
      >
        {invitation.question}
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3 sm:mt-10 sm:gap-5">
        <AcceptButton ref={yesRef} label={buttons.yes} onAccept={onAccept} />
        <EscapeButton
          label={buttons.no}
          teasers={buttons.noTeasers}
          avoidRefs={avoidRefs}
          onAttempt={onNoAttempt}
        />
      </div>
    </GlassCard>
  );
}
