"use client";

import { motion } from "motion/react";
import { Swords } from "lucide-react";
import type { ContractAnalysis } from "@/lib/types";

const staggerCards = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const cardFade = {
  hidden: { opacity: 0, y: 18, scale: 0.97, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

interface TopThreeFightProps {
  analysis: ContractAnalysis;
}

export default function TopThreeFight({ analysis }: TopThreeFightProps) {
  // Match topThreeToFight statements to their corresponding clauses
  const fightClauses = analysis.topThreeToFight.map((fightItem, index) => {
    // Try to find a matching clause by checking if the fight statement relates to a clause title
    const matchedClause = analysis.clauses.find(
      (clause) =>
        fightItem.toLowerCase().includes(clause.title.toLowerCase()) ||
        clause.title.toLowerCase().includes(fightItem.toLowerCase().slice(0, 20))
    );
    return { fightItem, clause: matchedClause, index };
  });

  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger/15 glow-danger">
          <Swords className="h-5 w-5 text-danger-light" />
        </div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Top 3 to Fight</h2>
      </div>

      <motion.div
        className="grid gap-4 sm:grid-cols-3"
        variants={staggerCards}
        initial="hidden"
        animate="show"
      >
        {fightClauses.map(({ fightItem, clause, index }) => (
          <motion.div
            key={index}
            variants={cardFade}
            className="gradient-border-danger rounded-2xl"
          >
            <div className="glass-card-interactive rounded-2xl p-5 glow-danger-hover h-full">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-danger/20 text-sm font-bold text-gradient-danger border border-danger/20">
                  {index + 1}
                </span>
                {clause && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-danger/30 bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger-light">
                    <span className="h-1.5 w-1.5 rounded-full bg-danger-light animate-pulse-dot" />
                    {clause.severity === "red"
                      ? "Dangerous"
                      : clause.severity === "amber"
                        ? "Concerning"
                        : "Fair"}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-semibold text-foreground leading-snug mb-2">
                {clause?.title ?? fightItem}
              </h3>

              <p className="text-sm text-foreground/70 leading-relaxed">
                {clause?.explanation ?? fightItem}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
