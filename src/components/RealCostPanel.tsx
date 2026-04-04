"use client";

import { motion } from "motion/react";
import { DollarSign } from "lucide-react";
import type { RealCost } from "@/lib/types";
import { renderMarkdown } from "@/lib/markdown";

interface RealCostPanelProps {
  realCost: RealCost;
}

export default function RealCostPanel({ realCost }: RealCostPanelProps) {
  if (!realCost.hasFinancialImpact) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="gradient-border-warning rounded-2xl">
        <div className="glass-card rounded-2xl p-6 glow-warning">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/15">
              <DollarSign className="h-5 w-5 text-warning-light" />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Real Cost to You
            </h2>
          </div>

          {realCost.estimatedCost && (
            <p className="text-3xl font-bold text-gradient-warning mb-3">
              {realCost.estimatedCost}
            </p>
          )}

          {realCost.explanation && (
            <p className="text-sm text-foreground/80 leading-relaxed">
              {renderMarkdown(realCost.explanation)}
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
}
