'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useReducedMotion } from 'motion/react';
import { Upload, FileText, ClipboardPaste, Loader2, Sparkles, Check } from 'lucide-react';

type Tab = 'upload' | 'paste';

interface ContractUploadProps {
  onTextExtracted: (text: string, pages?: number) => void;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

/* ── Floating particle for the dropzone ── */
function FloatingParticle({ delay, size, x, y }: { delay: number; size: number; x: string; y: string }) {
  const shouldReduce = useReducedMotion();
  if (shouldReduce) return null;

  return (
    <motion.div
      className="absolute rounded-full bg-accent/30 pointer-events-none"
      style={{ width: size, height: size, left: x, top: y }}
      animate={{
        y: [0, -20, 0],
        opacity: [0.2, 0.6, 0.2],
        scale: [1, 1.3, 1],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

/* ── Animated ring that pulses on drag ── */
function PulseRing({ active }: { active: boolean }) {
  const shouldReduce = useReducedMotion();
  if (shouldReduce || !active) return null;

  return (
    <>
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-accent/40 pointer-events-none"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: [0, 0.6, 0], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl border border-accent/20 pointer-events-none"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: [0, 0.4, 0], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      />
    </>
  );
}

/* ── Particles array config ── */
const PARTICLES = [
  { delay: 0, size: 4, x: '15%', y: '20%' },
  { delay: 0.5, size: 3, x: '75%', y: '15%' },
  { delay: 1.0, size: 5, x: '85%', y: '60%' },
  { delay: 1.5, size: 3, x: '25%', y: '70%' },
  { delay: 0.8, size: 4, x: '50%', y: '30%' },
  { delay: 1.2, size: 3, x: '60%', y: '80%' },
  { delay: 0.3, size: 5, x: '40%', y: '50%' },
  { delay: 1.8, size: 3, x: '10%', y: '45%' },
];

const TAB_CONFIG = [
  { id: 'upload' as const, label: 'Upload PDF', icon: FileText },
  { id: 'paste' as const, label: 'Paste Text', icon: ClipboardPaste },
] as const;

export default function ContractUpload({ onTextExtracted }: ContractUploadProps) {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [dropzoneHover, setDropzoneHover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldReduce = useReducedMotion();

  // Mouse glow tracking for dropzone
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const glowX = useTransform(mouseX, [0, 1], ['0%', '100%']);
  const glowY = useTransform(mouseY, [0, 1], ['0%', '100%']);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dropzoneRef.current) return;
    const rect = dropzoneRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size === 0) return 'The selected file is empty. Please choose a valid PDF.';
    if (file.size > MAX_FILE_SIZE) return 'File is too large (max 20 MB). Try a smaller file or paste text directly.';
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))
      return 'Only PDF files are supported. Select a .pdf or paste text directly.';
    return null;
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) { setError(validationError); return; }

      setError(null);
      setLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        let data: { text?: string; pages?: number; error?: string };
        try { data = await response.json(); }
        catch { throw new Error('malformed'); }

        if (!response.ok) {
          setError(data?.error || 'Something went wrong. Please try again or paste text directly.');
          return;
        }

        if (!data?.text) throw new Error('malformed');
        onTextExtracted(data.text, data.pages);
      } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof DOMException && err.name === 'AbortError') {
          setError('Upload timed out. Please try again or paste text directly.');
        } else {
          setError('Something went wrong. Please try again or paste text directly.');
        }
      } finally {
        setLoading(false);
      }
    },
    [validateFile, onTextExtracted]
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragActive(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragActive(false); }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  }, [uploadFile]);

  const handlePasteSubmit = useCallback(() => {
    const trimmed = pasteText.trim();
    if (!trimmed) return;
    onTextExtracted(trimmed);
  }, [pasteText, onTextExtracted]);

  const charCount = pasteText.trim().length;
  const charCountValid = charCount >= 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduce ? 0.01 : 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="relative rounded-2xl overflow-hidden"
    >
      {/* Outer glass container with gradient border */}
      <div className="glass-card rounded-2xl gradient-border">
        {/* ── Tab Switcher ── */}
        <div className="relative flex border-b border-white/[0.06]">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError(null); }}
                disabled={loading}
                className={`
                  relative flex-1 cursor-pointer px-6 py-4 text-sm font-medium transition-colors duration-200
                  ${isActive ? 'text-foreground' : 'text-muted hover:text-foreground/80'}
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </span>

                {/* Animated underline indicator */}
                {isActive && (
                  <motion.div
                    layoutId="upload-tab-indicator"
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
                    }}
                    transition={{
                      type: 'spring',
                      bounce: 0.15,
                      duration: shouldReduce ? 0.01 : 0.5,
                    }}
                  />
                )}

                {/* Active tab glow */}
                {isActive && !shouldReduce && (
                  <motion.div
                    layoutId="upload-tab-glow"
                    className="absolute inset-x-0 -bottom-px h-8 pointer-events-none"
                    style={{
                      background: 'radial-gradient(ellipse at bottom, rgba(59,130,246,0.08), transparent 70%)',
                    }}
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        <div className="p-5 sm:p-8">
          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
                transition={{ duration: shouldReduce ? 0.01 : 0.3 }}
                className="rounded-xl border border-danger/20 bg-danger/[0.06] px-4 py-3 text-sm text-danger-light overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-4 w-4 rounded-full bg-danger/20 flex items-center justify-center flex-shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-danger" />
                  </div>
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* ── Upload Tab ── */}
            {activeTab === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 16, filter: 'blur(4px)' }}
                transition={{ duration: shouldReduce ? 0.01 : 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                <div
                  ref={dropzoneRef}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onMouseEnter={() => setDropzoneHover(true)}
                  onMouseLeave={() => { setDropzoneHover(false); setDragActive(false); }}
                  onMouseMove={handleMouseMove}
                  onClick={() => !loading && fileInputRef.current?.click()}
                  className={`
                    group relative cursor-pointer rounded-2xl border-2 border-dashed
                    p-8 sm:p-14 text-center overflow-hidden
                    transition-all duration-300
                    ${dragActive
                      ? 'border-accent/60 bg-accent/[0.06]'
                      : 'border-white/[0.08] hover:border-accent/30 hover:bg-white/[0.015]'
                    }
                    ${loading ? 'pointer-events-none opacity-60' : ''}
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="Upload PDF file"
                  />

                  {/* ── Mouse-following glow ── */}
                  {(dropzoneHover || dragActive) && !shouldReduce && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        background: `radial-gradient(600px circle at ${glowX.get()} ${glowY.get()}, rgba(59,130,246,0.06), transparent 40%)`,
                      }}
                    />
                  )}

                  {/* ── Pulse rings on drag ── */}
                  <PulseRing active={dragActive} />

                  {/* ── Floating particles ── */}
                  {(dropzoneHover || dragActive) && PARTICLES.map((p, i) => (
                    <FloatingParticle key={i} {...p} />
                  ))}

                  {loading ? (
                    <div className="relative z-10 flex flex-col items-center gap-5">
                      {/* Spinner with glow */}
                      <div className="relative">
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          animate={shouldReduce ? {} : { opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{ boxShadow: '0 0 30px rgba(59,130,246,0.3)' }}
                        />
                        <Loader2 className="h-10 w-10 animate-spin text-accent relative z-10" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground/80">Processing your PDF…</p>
                        <p className="mt-1 text-xs text-muted/60">Extracting text and analyzing structure</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10">
                      {/* Icon container with hover glow */}
                      <motion.div
                        className={`
                          mx-auto mb-6 flex h-18 w-18 items-center justify-center rounded-2xl
                          border transition-all duration-300
                          ${dragActive
                            ? 'border-accent/40 bg-accent/15 glow-accent'
                            : 'border-white/[0.08] bg-white/[0.03] group-hover:border-accent/25 group-hover:bg-accent/[0.06]'
                          }
                        `}
                        animate={dragActive && !shouldReduce
                          ? { scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }
                          : {}
                        }
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Upload className={`
                          h-8 w-8 transition-colors duration-300
                          ${dragActive ? 'text-accent' : 'text-muted group-hover:text-accent/80'}
                        `} />
                      </motion.div>

                      <h3 className="text-lg font-semibold text-foreground">
                        {dragActive ? 'Drop to upload' : 'Drop your PDF here'}
                      </h3>
                      <p className="mt-2 text-sm text-muted">
                        {dragActive
                          ? 'Release to start processing'
                          : 'or click anywhere to browse files'}
                      </p>

                      {/* File specs badge */}
                      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-1.5">
                        <FileText className="h-3.5 w-3.5 text-muted/60" />
                        <span className="text-xs text-muted/60">PDF only · Max 20 MB</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Paste Tab ── */}
            {activeTab === 'paste' && (
              <motion.div
                key="paste"
                initial={{ opacity: 0, x: 16, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
                transition={{ duration: shouldReduce ? 0.01 : 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-5"
              >
                {/* Textarea with glow border on focus */}
                <div className="relative group/textarea">
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Paste your contract text here…"
                    rows={10}
                    className="
                      w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.02]
                      px-5 py-4 text-sm text-foreground placeholder-muted/40 leading-relaxed
                      transition-all duration-300
                      focus:border-accent/30 focus:outline-none focus:ring-1 focus:ring-accent/15
                      focus:bg-white/[0.03]
                    "
                  />
                  {/* Focus glow effect */}
                  {!shouldReduce && (
                    <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within/textarea:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ boxShadow: '0 0 40px rgba(59,130,246,0.06)' }}
                    />
                  )}
                </div>

                {/* Footer: char count + submit */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {charCount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5"
                      >
                        <div className={`h-1.5 w-1.5 rounded-full transition-colors ${charCountValid ? 'bg-safe' : 'bg-warning'}`} />
                        <span className={`text-xs transition-colors ${charCountValid ? 'text-safe/70' : 'text-warning/70'}`}>
                          {charCount.toLocaleString()} characters
                        </span>
                      </motion.div>
                    )}
                    {charCount === 0 && (
                      <p className="text-xs text-muted/50">
                        Paste the full contract text for best results
                      </p>
                    )}
                  </div>

                  <motion.button
                    onClick={handlePasteSubmit}
                    disabled={!pasteText.trim() || charCount < 50}
                    whileHover={!shouldReduce ? { scale: 1.02 } : {}}
                    whileTap={!shouldReduce ? { scale: 0.98 } : {}}
                    className="
                      cursor-pointer rounded-xl px-6 py-2.5 text-sm font-medium
                      transition-all duration-200
                      bg-accent text-white
                      hover:shadow-lg hover:shadow-accent/20
                      disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none
                    "
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Analyze Text
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
