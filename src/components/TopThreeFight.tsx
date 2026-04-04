"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Swords } from "lucide-react";
import type { ContractAnalysis } from "@/lib/types";

interface FightClause {
  fightItem: string;
  clause: ContractAnalysis["clauses"][number] | undefined;
  index: number;
}

interface CardProps {
  item: FightClause;
  position: "front" | "middle" | "back";
  handleShuffle: () => void;
}

function FightCard({ item, position, handleShuffle }: CardProps) {
  const dragRef = React.useRef(0);
  const isFront = position === "front";
  const { clause, fightItem, index } = item;

  const severityLabel =
    clause?.severity === "red"
      ? "Dangerous"
      : clause?.severity === "amber"
        ? "Concerning"
        : "Notable";

  const severityColor =
    clause?.severity === "red"
      ? "border-danger/40 bg-danger/15 text-danger-light"
      : clause?.severity === "amber"
        ? "border-warning/40 bg-warning/15 text-warning-light"
        : "border-border-light bg-surface-light text-muted";

  return (
    <motion.div
      style={{
        zIndex: position === "front" ? 2 : position === "middle" ? 1 : 0,
      }}
      animate={{
        rotate:
          position === "front" ? "-6deg" : position === "middle" ? "0deg" : "6deg",
        x: position === "front" ? "0%" : position === "middle" ? "33%" : "66%",
      }}
      drag={isFront}
      dragElastic={0.35}
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      onDragStart={(e) => {
        dragRef.current = (e as PointerEvent).clientX;
      }}
      onDragEnd={(e) => {
        if (dragRef.current - (e as PointerEvent).clientX > 150) {
          handleShuffle();
        }
        dragRef.current = 0;
      }}
      transition={{ duration: 0.35 }}
      className={`absolute left-0 top-0 flex h-[420px] w-[320px] select-none flex-col gap-5 rounded-2xl border border-danger/25 bg-surface/60 p-6 shadow-xl backdrop-blur-md${
        isFront ? " cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      {/* Number + severity */}
      <div className="flex items-center justify-between">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-danger/20 text-base font-bold text-gradient-danger border border-danger/30">
          {index + 1}
        </span>
        {clause && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${severityColor}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot" />
            {severityLabel}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-foreground leading-snug">
        {clause?.title ?? fightItem}
      </h3>

      {/* Explanation */}
      <p className="text-sm text-foreground/65 leading-relaxed line-clamp-[8]">
        {clause?.explanation ?? fightItem}
      </p>

      {/* Drag hint on front card */}
      {isFront && (
        <p className="mt-auto text-xs text-muted/60 text-center tracking-wide">
          drag left to see next →
        </p>
      )}
    </motion.div>
  );
}

interface TopThreeFightProps {
  analysis: ContractAnalysis;
}

export default function TopThreeFight({ analysis }: TopThreeFightProps) {
  const fightClauses: FightClause[] = analysis.topThreeToFight.map(
    (fightItem, index) => {
      const matchedClause = analysis.clauses.find(
        (clause) =>
          fightItem.toLowerCase().includes(clause.title.toLowerCase()) ||
          clause.title.toLowerCase().includes(fightItem.toLowerCase().slice(0, 20))
      );
      return { fightItem, clause: matchedClause, index };
    }
  );

  const [positions, setPositions] = React.useState<Array<"front" | "middle" | "back">>([
    "front",
    "middle",
    "back",
  ]);

  const handleShuffle = () => {
    setPositions((prev) => {
      const next = [...prev] as Array<"front" | "middle" | "back">;
      next.unshift(next.pop()!);
      return next;
    });
  };

  return (
    <section>
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger/15 glow-danger">
          <Swords className="h-5 w-5 text-danger-light" />
        </div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Top 3 to Fight</h2>
      </div>

      <div className="flex justify-center">
        <div className="relative h-[420px] w-[320px] ml-[100px]">
          {fightClauses.map((item, i) => (
            <FightCard
              key={item.index}
              item={item}
              position={positions[i]}
              handleShuffle={handleShuffle}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
