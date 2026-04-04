'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Check, Circle, Loader2, Sparkles, X } from 'lucide-react';

const STEPS = [
  { label: 'Reading your contract', threshold: 0 },
  { label: 'Identifying risky clauses', threshold: 15 },
  { label: 'Analyzing severity levels', threshold: 35 },
  { label: 'Finding your leverage points', threshold: 55 },
  { label: 'Assessing financial impact', threshold: 75 },
  { label: 'Preparing your analysis', threshold: 88 },
];

const TIPS = [
  'Non-compete clauses are unenforceable in California',
  'You can always ask — the worst they can say is no',
  '67% of contracts have at least one negotiable clause',
  'Most employers expect some level of negotiation',
  'Verbal promises not in writing are rarely enforceable',
];

interface AnalysisLoadingProps {
  onCancel?: () => void;
}

export default function AnalysisLoading({ onCancel }: AnalysisLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // Progress bar: fast early, slows near end, caps at ~92%
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const remaining = 92 - prev;
        const increment = Math.max(0.3, remaining * 0.04 + Math.random() * 1.5);
        return Math.min(92, prev + increment);
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Rotate tips every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStepStatus = useCallback(
    (index: number): 'completed' | 'current' | 'future' => {
      const nextThreshold = STEPS[index + 1]?.threshold ?? 100;
      if (progress >= nextThreshold) return 'completed';
      if (progress >= STEPS[index].threshold) return 'current';
      return 'future';
    },
    [progress]
  );

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Pulsing shield icon */}
      <div className="relative mb-10">
        {/* Outer pulse rings */}
        <motion.div
          className="absolute inset-0 rounded-full bg-accent/10"
          animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          style={{ width: 80, height: 80, left: -8, top: -8 }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-accent/10"
          animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
          style={{ width: 80, height: 80, left: -8, top: -8 }}
        />
        {/* Shield container */}
        <motion.div
          className="glass-card relative flex h-16 w-16 items-center justify-center rounded-2xl"
          animate={{
            boxShadow: [
              '0 0 20px rgba(59,130,246,0.15)',
              '0 0 40px rgba(59,130,246,0.3)',
              '0 0 20px rgba(59,130,246,0.15)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Shield className="h-7 w-7 text-accent" />
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted">Analyzing…</span>
          <motion.span
            className="text-xs font-mono text-accent tabular-nums"
            key={Math.round(progress)}
          >
            {Math.round(progress)}%
          </motion.span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, var(--color-accent), #22d3ee)',
              boxShadow: '0 0 12px rgba(59,130,246,0.4)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Step checklist */}
      <div className="w-full max-w-xs space-y-1 mb-10">
        {STEPS.map((step, i) => {
          const status = getStepStatus(i);
          return (
            <motion.div
              key={step.label}
              className="flex items-center gap-3 rounded-lg px-3 py-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {status === 'completed' && (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', bounce: 0.5, duration: 0.4 }}
                  >
                    <Check className="h-4 w-4 text-safe" />
                  </motion.div>
                )}
                {status === 'current' && (
                  <motion.div
                    key="loader"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Loader2 className="h-4 w-4 text-accent animate-spin" />
                  </motion.div>
                )}
                {status === 'future' && (
                  <motion.div
                    key="circle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Circle className="h-4 w-4 text-muted/40" />
                  </motion.div>
                )}
              </AnimatePresence>
              <span
                className={
                  status === 'completed'
                    ? 'text-sm text-safe opacity-70'
                    : status === 'current'
                      ? 'text-sm font-medium text-foreground'
                      : 'text-sm text-muted/40'
                }
              >
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Did you know? tips */}
      <div className="mb-8 h-14 w-full max-w-xs flex flex-col items-center justify-center">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="h-3 w-3 text-accent" />
          <span className="text-xs font-medium text-accent">Did you know?</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={tipIndex}
            className="text-xs text-muted text-center leading-relaxed"
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
          className="flex items-center gap-1.5 rounded-xl border border-white/10 px-5 py-2 text-sm text-muted transition-colors hover:border-danger/30 hover:text-danger cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
      )}
    </motion.div>
  );
}
