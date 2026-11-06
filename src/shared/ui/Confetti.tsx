"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { randomBetween, randomItem } from "@/shared/lib";
import { useIsClient } from "@/shared/lib/useIsClient";
import { HeartShape } from "./HeartShape";

type PieceShape = "strip" | "dot" | "heart";

interface Piece {
  id: number;
  kind: "fall" | "rise";
  shape: PieceShape;
  color: string;
  left: number;
  size: number;
  drift: number;
  spin: number;
  duration: number;
  delay: number;
}

const COLORS = [
  "text-rose",
  "text-rose-soft",
  "text-blush-200",
  "text-gold",
  "text-rose-deep",
] as const;
const SHAPES: readonly PieceShape[] = ["strip", "strip", "dot", "heart"];

function makePieces(): Piece[] {
  const small = window.innerWidth < 640;
  const fallCount = small ? 26 : 54;
  const riseCount = small ? 7 : 12;
  const pieces: Piece[] = [];
  for (let i = 0; i < fallCount; i += 1) {
    pieces.push({
      id: i,
      kind: "fall",
      shape: randomItem(SHAPES) ?? "strip",
      color: randomItem(COLORS) ?? "text-rose",
      left: randomBetween(0, 100),
      size: randomBetween(7, 13),
      drift: randomBetween(-80, 80),
      spin: randomBetween(-540, 540),
      duration: randomBetween(2.8, 4.6),
      delay: randomBetween(0, 1.2),
    });
  }
  for (let i = 0; i < riseCount; i += 1) {
    pieces.push({
      id: fallCount + i,
      kind: "rise",
      shape: "heart",
      color: randomItem(COLORS) ?? "text-rose",
      left: randomBetween(5, 95),
      size: randomBetween(16, 30),
      drift: randomBetween(-40, 40),
      spin: randomBetween(-20, 20),
      duration: randomBetween(3.2, 5),
      delay: randomBetween(0.2, 1.6),
    });
  }
  return pieces;
}

function PieceShapeView({ shape }: { shape: PieceShape }) {
  if (shape === "heart") return <HeartShape className="block size-full" />;
  if (shape === "dot")
    return <span className="block size-full rounded-full bg-current" />;
  return <span className="block h-full w-1/2 rounded-[2px] bg-current" />;
}

function ConfettiLayer() {
  const [pieces, setPieces] = useState(makePieces);
  const remove = (id: number) =>
    setPieces((list) => list.filter((piece) => piece.id !== id));

  return pieces.map((piece) => {
    const isFall = piece.kind === "fall";
    return (
      <motion.span
        key={piece.id}
        className={`absolute ${isFall ? "-top-6" : "top-full"} ${piece.color} will-change-transform`}
        style={{
          left: `${piece.left}%`,
          width: piece.size,
          height: piece.size,
        }}
        initial={{ y: 0, x: 0, rotate: 0, opacity: isFall ? 1 : 0 }}
        animate={{
          y: isFall ? "110vh" : "-75vh",
          x: piece.drift,
          rotate: piece.spin,
          opacity: isFall ? [1, 1, 0] : [0, 0.9, 0],
        }}
        transition={{
          duration: piece.duration,
          delay: piece.delay,
          ease: isFall ? "easeIn" : "easeOut",
        }}
        onAnimationComplete={() => remove(piece.id)}
      >
        <PieceShapeView shape={piece.shape} />
      </motion.span>
    );
  });
}

interface ConfettiProps {
  /** Change the key to fire a new burst. */
  burstKey?: number;
}

/** One burst of falling confetti and rising hearts. Pieces leave the DOM when done. */
export function Confetti({ burstKey = 0 }: ConfettiProps) {
  const isClient = useIsClient();
  const reduceMotion = useReducedMotion();
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
    >
      {isClient && !reduceMotion && <ConfettiLayer key={burstKey} />}
    </div>
  );
}
