"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dumbbell, Zap, ChevronRight } from "lucide-react";
import type { Clause } from "@/lib/types";
import { renderMarkdown } from "@/lib/markdown";

const SEVERITY_STYLES: Record<
  string,
  { badge: string; border: string; glow: string; label: string }
> = {
  red: {
    badge: "bg-danger/15 text-danger-light border-danger/30",
    border: "border-danger/20 hover:border-danger/40",
    glow: "glow-danger glow-danger-hover",
    label: "Dangerous",
  },
  amber: {
    badge: "bg-warning/15 text-warning-light border-warning/30",
    border: "border-warning/20 hover:border-warning/40",
    glow: "glow-warning-hover",
    label: "Concerning",
  },
  green: {
    badge: "bg-safe/15 text-safe-light border-safe/30",
    border: "border-safe/20 hover:border-safe/40",
    glow: "glow-safe glow-safe-hover",
    label: "Fair",
  },
};

interface ClauseCardProps {
  clause: Clause;
  index?: number;
  onPractice?: () => void;
}

export default function ClauseCard({ clause, index = 0, onPractice }: ClauseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const style = SEVERITY_STYLES[clause.severity] ?? SEVERITY_STYLES.green;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14, filter: "blur(3px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
      }}
      className={`glass-card-interactive rounded-2xl p-6 ${style.border} ${style.glow}`}
    >
      {/* Header: severity badge + title */}
      <div className="flex items-start gap-3 mb-3">
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.badge}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              clause.severity === "red" ? "bg-danger-light animate-pulse-dot" :
              clause.severity === "amber" ? "bg-warning-light" :
              "bg-safe-light"
            }`}
          />
          {style.label}
        </span>
        <h3 className="text-base font-semibold text-foreground leading-snug">
          {clause.title}
        </h3>
      </div>

      {/* Explanation */}
      <p className="text-sm text-foreground/80 leading-relaxed mb-4">
        {renderMarkdown(clause.explanation)}
      </p>

      {/* Leverage callout */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 mb-4">
        <p className="text-xs font-medium text-accent-light mb-1 flex items-center gap-1.5">
          <Dumbbell className="h-3.5 w-3.5" />
          Your Leverage
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {renderMarkdown(clause.leverage)}
        </p>
      </div>

      {/* Practice This button — red/amber clauses only */}
      {onPractice && (clause.severity === "red" || clause.severity === "amber") && (
        <button
          onClick={onPractice}
          className="mb-4 inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent/85 cursor-pointer"
        >
          <Zap className="h-3.5 w-3.5" />
          Practice This
        </button>
      )}

      {/* Expandable original text */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
      >
        <motion.span
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </motion.span>
        {expanded ? "Hide original text" : "Show original text"}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, scale: 0.98 }}
            animate={{ height: "auto", opacity: 1, scale: 1 }}
            exit={{ height: 0, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl border border-white/5 bg-background/60 backdrop-blur-sm px-4 py-3">
              <p className="text-xs text-muted leading-relaxed font-mono whitespace-pre-wrap">
                {clause.originalText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
