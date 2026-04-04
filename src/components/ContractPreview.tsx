'use client';

import { motion } from 'motion/react';
import { CheckCircle, RotateCcw } from 'lucide-react';

interface ContractPreviewProps {
  text: string;
  pages?: number;
  onStartOver: () => void;
  onAnalyze?: () => void;
  analyzing?: boolean;
}

const PREVIEW_CHAR_LIMIT = 2000;

export default function ContractPreview({
  text,
  pages,
  onStartOver,
  onAnalyze,
  analyzing = false,
}: ContractPreviewProps) {
  const isTruncated = text.length > PREVIEW_CHAR_LIMIT;
  const displayText = isTruncated ? text.slice(0, PREVIEW_CHAR_LIMIT) : text;

  return (
    <motion.div
      className="rounded-2xl glass-card overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-safe/10">
            <CheckCircle className="h-5 w-5 text-safe" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Contract Text Extracted</h3>
            <p className="text-xs text-muted">
              {pages ? `${pages} page${pages !== 1 ? 's' : ''}` : 'Pasted text'}
              {' \u00b7 '}
              {text.length.toLocaleString()} characters
            </p>
          </div>
        </div>
        <button
          onClick={onStartOver}
          className="flex items-center gap-1.5 rounded-lg border border-black/[0.08] px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-black/[0.15] hover:text-foreground cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          Start Over
        </button>
      </div>

      {/* Text preview */}
      <div className="p-5 sm:p-6">
        <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-xl border border-black/[0.06] bg-white/60 p-4 font-mono text-xs leading-relaxed text-foreground/70">
          {displayText}
        </pre>
        {isTruncated && (
          <p className="mt-3 text-xs text-muted/60">
            Showing first {PREVIEW_CHAR_LIMIT.toLocaleString()} of {text.length.toLocaleString()} characters
          </p>
        )}

        {onAnalyze && (
          <motion.button
            onClick={onAnalyze}
            disabled={analyzing}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="mt-6 w-full cursor-pointer rounded-xl bg-accent py-3.5 text-base font-semibold text-white transition-all hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? 'Analyzing…' : 'Analyze Contract'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
