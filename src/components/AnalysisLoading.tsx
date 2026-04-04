'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Loader2, Circle, X, Sparkles } from 'lucide-react';
import { CpuArchitecture } from '@/components/ui/CpuArchitecture';

const STEPS = [
  { label: 'Reading your contract', threshold: 15 },
  { label: 'Identifying risky clauses', threshold: 35 },
  { label: 'Analyzing severity levels', threshold: 55 },
  { label: 'Finding your leverage points', threshold: 75 },
  { label: 'Assessing financial impact', threshold: 88 },
  { label: 'Preparing your analysis', threshold: 100 },
];

const TIPS = [
  'Non-compete clauses are unenforceable in California.',
  'You can always ask. The worst they can say is no.',
  '67% of contracts have at least one negotiable clause.',
  'Most employers expect some level of negotiation.',
  'Verbal promises not in writing are rarely enforceable.',
];

interface AnalysisLoadingProps {
  onCancel?: () => void;
}

export default function AnalysisLoading({ onCancel }: AnalysisLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // Simulated progress that decelerates near the end
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const remaining = 92 - prev;
        const increment = remaining * 0.04 + Math.random() * 1.5;
        return Math.min(92, prev + increment);
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStepStatus = useCallback(
    (threshold: number, index: number) => {
      const prevThreshold = index === 0 ? 0 : STEPS[index - 1].threshold;
      if (progress >= threshold) return 'done';
      if (progress >= prevThreshold) return 'active';
      return 'pending';
    },
    [progress],
  );

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 px-8 min-h-[70vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* CPU Architecture Animation */}
      <motion.div
        className="relative mb-10 w-full max-w-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="relative rounded-2xl glass-card p-8 overflow-hidden">
          {/* Subtle glow behind the chip */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-40 h-40 rounded-full bg-accent/10 blur-3xl" />
          </div>
          <CpuArchitecture
            text="AI"
            className="relative z-10 text-muted/50"
            width="100%"
            height="100%"
          />
        </div>
      </motion.div>

      {/* Progress bar */}
      <div className="w-full max-w-lg mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold text-foreground">Analyzing your contract</span>
          <span className="text-lg font-mono font-semibold text-accent">{Math.round(progress)}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-black/[0.07] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #f97316, #c2410c)',
              boxShadow: '0 0 16px rgba(194,65,12,0.4)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Step checklist */}
      <div className="w-full max-w-lg space-y-4 mb-12">
        {STEPS.map((step, i) => {
          const status = getStepStatus(step.threshold, i);
          return (
            <motion.div
              key={step.label}
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {status === 'done' && (
                  <motion.div
                    key="done"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-safe/20"
                  >
                    <Check className="h-4 w-4 text-safe" />
                  </motion.div>
                )}
                {status === 'active' && (
                  <motion.div
                    key="active"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex h-7 w-7 items-center justify-center"
                  >
                    <Loader2 className="h-5 w-5 text-accent animate-spin" />
                  </motion.div>
                )}
                {status === 'pending' && (
                  <motion.div
                    key="pending"
                    className="flex h-7 w-7 items-center justify-center"
                  >
                    <Circle className="h-4 w-4 text-muted/30" />
                  </motion.div>
                )}
              </AnimatePresence>
              <span
                className={
                  status === 'done'
                    ? 'text-base text-safe/70'
                    : status === 'active'
                      ? 'text-base font-semibold text-foreground'
                      : 'text-base text-muted/40'
                }
              >
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Did you know tip */}
      <div className="w-full max-w-lg mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-accent/60" />
          <span className="text-sm font-semibold text-accent/60 uppercase tracking-wider">Did you know?</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={tipIndex}
            className="text-base text-muted/70 leading-relaxed"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            {TIPS[tipIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Cancel button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="flex items-center gap-2 rounded-xl border border-black/[0.08] px-6 py-2.5 text-base text-muted transition-colors hover:border-danger/30 hover:text-danger cursor-pointer"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      )}
    </motion.div>
  );
}
