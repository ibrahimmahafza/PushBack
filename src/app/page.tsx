'use client';

import { motion } from 'motion/react';
import {
  Shield,
  ArrowRight,
  FileText,
  Swords,
  ScrollText,
  CheckCircle2,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import LandingNav from '@/components/LandingNav';
import { BackgroundShader } from '@/components/ui/BackgroundShader';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Glow Card (mouse-tracking spotlight)                               */
/* ------------------------------------------------------------------ */
const glowColorMap: Record<string, { base: number; spread: number }> = {
  blue: { base: 220, spread: 200 },
  cyan: { base: 190, spread: 200 },
  teal: { base: 170, spread: 200 },
};

function GlowCard({
  children,
  className = '',
  glowColor = 'blue',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  delay?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      if (cardRef.current) {
        cardRef.current.style.setProperty('--x', e.clientX.toFixed(2));
        cardRef.current.style.setProperty('--xp', (e.clientX / window.innerWidth).toFixed(2));
        cardRef.current.style.setProperty('--y', e.clientY.toFixed(2));
      }
    };
    document.addEventListener('pointermove', syncPointer);
    return () => document.removeEventListener('pointermove', syncPointer);
  }, []);

  const { base, spread } = glowColorMap[glowColor] ?? glowColorMap.blue;

  return (
    <motion.div
      ref={cardRef}
      data-glow
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      style={{
        '--base': base,
        '--spread': spread,
        '--radius': '14',
        '--border': '3',
        '--backdrop': 'hsl(0 0% 60% / 0.12)',
        '--backup-border': 'var(--backdrop)',
        '--size': '200',
        '--border-size': 'calc(var(--border, 2) * 1px)',
        '--spotlight-size': 'calc(var(--size, 150) * 1px)',
        '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
        backgroundImage: `radial-gradient(
          var(--spotlight-size) var(--spotlight-size) at
          calc(var(--x, 0) * 1px)
          calc(var(--y, 0) * 1px),
          hsl(var(--hue, 210) 100% 70% / 0.1), transparent
        )`,
        backgroundColor: 'var(--backdrop, transparent)',
        backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
        backgroundPosition: '50% 50%',
        backgroundAttachment: 'fixed',
        border: 'var(--border-size) solid var(--backup-border)',
        position: 'relative',
        touchAction: 'none',
      } as React.CSSProperties}
      className={cn('w-full h-full rounded-2xl relative backdrop-blur-[5px] p-6', className)}
    >
      <div data-glow />
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Glow CSS                                                           */
/* ------------------------------------------------------------------ */
const GLOW_STYLES = `
[data-glow]::before,[data-glow]::after{pointer-events:none;content:"";position:absolute;inset:calc(var(--border-size,2px)*-1);border:var(--border-size,2px) solid transparent;border-radius:calc(var(--radius,14)*1px);background-attachment:fixed;background-size:calc(100% + (2*var(--border-size,2px))) calc(100% + (2*var(--border-size,2px)));background-repeat:no-repeat;background-position:50% 50%;mask:linear-gradient(transparent,transparent),linear-gradient(white,white);mask-clip:padding-box,border-box;mask-composite:intersect}
[data-glow]::before{background-image:radial-gradient(calc(var(--spotlight-size,150px)*0.75) calc(var(--spotlight-size,150px)*0.75) at calc(var(--x,0)*1px) calc(var(--y,0)*1px),hsl(var(--hue,210) 100% 50%/1),transparent 100%);filter:brightness(2)}
[data-glow]::after{background-image:radial-gradient(calc(var(--spotlight-size,150px)*0.5) calc(var(--spotlight-size,150px)*0.5) at calc(var(--x,0)*1px) calc(var(--y,0)*1px),hsl(0 100% 100%/1),transparent 100%)}
[data-glow] [data-glow]{position:absolute;inset:0;will-change:filter;opacity:var(--outer,1);border-radius:calc(var(--radius,14)*1px);filter:blur(calc(var(--border-size,2px)*10));background:none;pointer-events:none;border:none}
[data-glow]>[data-glow]::before{inset:-10px;border-width:10px}
`;

/* ------------------------------------------------------------------ */
/*  Animated text reveal                                               */
/* ------------------------------------------------------------------ */
function AnimatedTitle() {
  const words1 = ['Understand.'];
  const words2 = ['Push', 'Back.'];
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const total = words1.length + words2.length;
    if (visible < total) {
      const t = setTimeout(() => setVisible(visible + 1), 400);
      return () => clearTimeout(t);
    }
  }, [visible, words1.length, words2.length]);

  return (
    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-[1.1]">
      <span className="block">
        {words1.map((word, i) => (
          <motion.span
            key={`a-${i}`}
            className="inline-block bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80"
            initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
            animate={i < visible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          >
            {word}
          </motion.span>
        ))}
      </span>
      <span className="block">
        {words2.map((word, i) => {
          const globalIndex = words1.length + i;
          return (
            <motion.span
              key={`b-${i}`}
              className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-white/90 to-cyan-300 mr-4"
              initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
              animate={globalIndex < visible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
            >
              {word}
            </motion.span>
          );
        })}
      </span>
    </h1>
  );
}

/* ------------------------------------------------------------------ */
/*  Scan line effect                                                   */
/* ------------------------------------------------------------------ */
function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent pointer-events-none z-20"
      initial={{ top: '0%' }}
      animate={{ top: ['0%', '100%', '0%'] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Feature + stat data                                                */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: FileText,
    title: 'Upload & Analyze',
    description: 'Drop a PDF or paste text. AI extracts every clause and rates it by severity: dangerous, concerning, or fair.',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    glowColor: 'blue',
    bullets: ['PDF & text support', 'Severity-coded clauses'],
  },
  {
    icon: Swords,
    title: 'Practice Negotiating',
    description: 'Spar against an AI counterparty who responds like a real HR manager, landlord, or client. Get coaching after each exchange.',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    glowColor: 'cyan',
    bullets: ['Realistic AI counterparty', 'Real-time coaching notes'],
  },
  {
    icon: ScrollText,
    title: 'Get Your Script',
    description: 'Walk away with exact phrases to say, ask, and insist on. Personalized from your sparring session.',
    iconColor: 'text-teal-400',
    iconBg: 'bg-teal-500/10',
    glowColor: 'teal',
    bullets: ['Ready-to-use phrases', 'Tone & delivery tips'],
  },
];

const stats = [
  { value: '3 Steps', label: 'Upload, Analyze, Practice' },
  { value: '< 30s', label: 'AI analysis time' },
  { value: 'AI-Powered', label: 'Powered by Claude Sonnet 4.5' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, delay: 0.5 + i * 0.2, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function Home() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center overflow-hidden bg-[#030303]">
      <style dangerouslySetInnerHTML={{ __html: GLOW_STYLES }} />
      <LandingNav />

      {/* Animated shader background */}
      <div className="absolute inset-0 z-0 opacity-60">
        <BackgroundShader className="w-full h-full absolute inset-0" speed={0.3} />
      </div>

      {/* Scan line */}
      <ScanLine />

      {/* Grid overlay for futuristic feel */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />

      {/* ── HERO ── */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 md:px-6 pt-32 sm:pt-40">
        <div className="text-center mb-12">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8"
          >
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-white/60 tracking-wide">AI-Powered Contract Intelligence</span>
          </motion.div>

          {/* Animated title */}
          <AnimatedTitle />

          {/* Tagline */}
          <motion.p
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-lg md:text-xl text-white/40 mb-12 leading-relaxed font-light max-w-2xl mx-auto"
          >
            Upload any contract. Get severity-coded analysis in seconds.
            Practice negotiating with AI. Leave with a ready-to-use script.
          </motion.p>

          {/* CTA */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link
              href="/login"
              className="group relative cursor-pointer isolate overflow-hidden px-8 py-4 rounded-full font-semibold text-base text-white bg-gradient-to-b from-accent to-blue-600 border border-accent/50 shadow-[0_0_24px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-500 active:translate-y-0.5"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <button
              type="button"
              className="px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10 transition-all font-semibold cursor-pointer"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="flex items-center gap-2">
                See How It Works
                <ChevronDown className="h-4 w-4" />
              </span>
            </button>
          </motion.div>
        </div>

        {/* ── STATS ── */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto grid max-w-2xl grid-cols-3 gap-4 sm:gap-6 mb-20"
        >
          {stats.map((stat) => (
            <div key={stat.value} className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-5 text-center backdrop-blur-sm">
              <div className="text-lg font-bold text-white sm:text-xl">{stat.value}</div>
              <div className="mt-1 text-xs text-white/30 sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* ── FEATURES ── */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
          {features.map((feature, i) => (
            <GlowCard key={feature.title} glowColor={feature.glowColor} delay={0.6 + i * 0.2}>
              <div className="flex flex-col h-full">
                <div className={cn('flex items-center justify-center w-12 h-12 rounded-xl mb-5', feature.iconBg)}>
                  <feature.icon className={cn('w-6 h-6', feature.iconColor)} strokeWidth={1.5} />
                </div>
                <div className="mb-2 text-[11px] font-medium uppercase tracking-widest text-white/25">Step {i + 1}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/50 mb-4 flex-grow text-sm leading-relaxed">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-white/40">
                      <CheckCircle2 className={cn('w-4 h-4 flex-shrink-0', feature.iconColor)} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </GlowCard>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 w-full border-t border-white/5 mt-12">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <Shield className="h-4 w-4 text-blue-400" strokeWidth={1.5} />
              </div>
              <span className="text-lg font-semibold text-white">
                Push<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Back</span>
              </span>
            </Link>
            <p className="text-base font-medium text-white/50 mb-2">The fine print has met its match.</p>
            <p className="text-sm text-white/30 max-w-md">
              Built for immigrants, gig workers, renters, and anyone who has never been taught to push back.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/25">
            <Link href="/pricing" className="hover:text-white/60 transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-white/60 transition-colors">Sign In</Link>
            <a href="#features" className="hover:text-white/60 transition-colors">Features</a>
          </div>
          <div className="mt-8 text-center text-xs text-white/15">&copy; 2026 PushBack. Not legal advice.</div>
        </div>
      </footer>
    </div>
  );
}
