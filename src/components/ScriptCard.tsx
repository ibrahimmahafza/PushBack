"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ClipboardList, Copy, Check, Lightbulb, ArrowLeft } from "lucide-react";
import type { NegotiationScript } from "@/lib/types";

const SEVERITY_STYLES: Record<string, { badge: string; label: string }> = {
  red: {
    badge: "bg-danger/15 text-danger-light border-danger/30",
    label: "Dangerous",
  },
  amber: {
    badge: "bg-warning/15 text-warning-light border-warning/30",
    label: "Concerning",
  },
  green: {
    badge: "bg-safe/15 text-safe-light border-safe/30",
    label: "Fair",
  },
};

const ACTION_VERBS = ["Say:", "Ask:", "Insist:", "Tell:", "Request:", "Demand:", "Propose:", "Suggest:", "State:", "Emphasize:"];

function extractVerb(bullet: string): { verb: string; rest: string } | null {
  for (const v of ACTION_VERBS) {
    if (bullet.startsWith(v)) {
      return { verb: v, rest: bullet.slice(v.length).trim() };
    }
  }
  // Try matching any "Word:" pattern at start
  const match = bullet.match(/^([A-Z][a-z]+:)\s*/);
  if (match) {
    return { verb: match[1], rest: bullet.slice(match[0].length) };
  }
  return null;
}

interface ScriptCardProps {
  script: NegotiationScript;
  clauseTitle: string;
  severity: string;
  onBackToAnalysis: () => void;
  onPracticeAnother: () => void;
}

export default function ScriptCard({
  script,
  clauseTitle,
  severity,
  onBackToAnalysis,
  onPracticeAnother,
}: ScriptCardProps) {
  const [copied, setCopied] = useState(false);
  const sevStyle = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.green;

  async function handleCopy() {
    const text = script.bullets
      .map((b, i) => `${i + 1}. ${b}`)
      .join("\n");
    const full = `${script.title}\n\n${text}\n\nTone Tip: ${script.toneTip}`;

    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: clipboard may not be available
      console.warn("[ScriptCard] Clipboard API not available");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mx-auto max-w-lg"
    >
      {/* Gradient accent border wrapper */}
      <div className="gradient-border rounded-2xl glow-accent">
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15">
                  <ClipboardList className="h-4.5 w-4.5 text-accent-light" />
                </div>
                {script.title}
              </h2>
              <div className="flex items-center gap-2 ml-10">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${sevStyle.badge}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    severity === "red" ? "bg-danger-light" :
                    severity === "amber" ? "bg-warning-light" : "bg-safe-light"
                  }`} />
                  {sevStyle.label}
                </span>
                <span className="text-xs text-muted truncate max-w-[200px]">
                  {clauseTitle}
                </span>
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-lg glass-card-interactive px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <><Check className="h-3.5 w-3.5 text-safe-light" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
            </button>
          </div>

          {/* 3 Bullets */}
          <motion.div
            className="space-y-3 mb-5"
            initial="hidden"
            animate="show"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
          >
            {script.bullets.map((bullet, i) => {
              const parsed = extractVerb(bullet);
              return (
                <motion.div
                  key={i}
                  variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0, transition: { duration: 0.35 } } }}
                  className="flex gap-2 sm:gap-3 rounded-xl border border-white/5 bg-surface/40 backdrop-blur-sm px-3 py-2.5 sm:px-4 sm:py-3 glow-accent-hover transition-shadow"
                >
                  <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-accent/15 border border-accent/20 text-accent-light text-xs font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">
                    {parsed ? (
                      <>
                        <strong className="text-accent-light">{parsed.verb}</strong>{" "}
                        {parsed.rest}
                      </>
                    ) : (
                      bullet
                    )}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Tone Tip */}
          <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 mb-6">
            <p className="text-xs font-medium text-accent-light mb-0.5 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5" />
              Tone Tip
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {script.toneTip}
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            <button
              onClick={onBackToAnalysis}
              className="flex-1 rounded-xl glass-card-interactive px-4 py-2.5 text-sm font-medium text-muted hover:text-foreground cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Analysis
            </button>
            <button
              onClick={onPracticeAnother}
              className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-pointer"
            >
              Practice Another
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
