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
      className="w-full max-w-[34rem] px-6 pt-12 pb-10 text-center sm:px-12 sm:pt-14 sm:pb-12"
    >
      <HeartShape className="absolute -top-5 left-1/2 size-10 -translate-x-1/2 text-rose drop-shadow-[0_6px_14px_rgba(198,58,104,0.35)]" />
      <h1
        id="invitation-heading"
        ref={headingRef}
        className="mx-auto w-fit font-display text-[1.45rem] italic text-ink-soft sm:text-[1.7rem]"
      >
        {getGreeting()}
      </h1>
      <p
        ref={questionRef}
        className="mx-auto mt-4 w-fit max-w-[14ch] text-balance font-display text-[2.4rem] leading-[1.08] font-medium tracking-[-0.01em] text-ink sm:text-[3.25rem]"
      >
        {invitation.question}
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
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
