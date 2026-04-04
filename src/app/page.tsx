'use client';

import { motion } from 'motion/react';
import { Shield, ArrowRight, FileText, Swords, ScrollText, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import LandingNav from '@/components/LandingNav';

/* ------------------------------------------------------------------ */
/*  Feature cards data                                                 */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: FileText,
    title: 'Upload Your Contract',
    description:
      'Drop a PDF or paste text. We extract every clause and break it down in plain language.',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    glowColor: 'rgba(59,130,246,0.12)',
  },
  {
    icon: Swords,
    title: 'AI-Powered Analysis',
    description:
      'Get severity-coded clauses, leverage points, and a clear breakdown of what actually matters.',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    glowColor: 'rgba(6,182,212,0.12)',
  },
  {
    icon: ScrollText,
    title: 'Practice Pushing Back',
    description:
      'Spar against an AI counterparty. Build confidence and leave with a ready-to-use script.',
    iconColor: 'text-teal-400',
    iconBg: 'bg-teal-500/10',
    glowColor: 'rgba(20,184,166,0.12)',
  },
];

/* ------------------------------------------------------------------ */
/*  Stats data                                                         */
/* ------------------------------------------------------------------ */
const stats = [
  { value: '3 Steps', label: 'Upload → Analyze → Practice' },
  { value: '< 2 Minutes', label: 'From upload to insights' },
  { value: 'AI-Powered', label: 'Claude + Gemini analysis' },
];

/* ------------------------------------------------------------------ */
/*  Dot grid positions — generated client-side only to avoid           */
/*  hydration mismatch from Math.random()                              */
/* ------------------------------------------------------------------ */
function useDotGrid(count: number) {
  const [dots, setDots] = useState<
    { id: number; x: number; y: number; size: number; opacity: number }[]
  >([]);

  useEffect(() => {
    setDots(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.25 + 0.05,
      })),
    );
  }, [count]);

  return dots;
}

/* ------------------------------------------------------------------ */
/*  Easing presets                                                     */
/* ------------------------------------------------------------------ */
const easeOut = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function Home() {
  const dots = useDotGrid(60);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <LandingNav />

      {/* ============================================================ */}
      {/*  ANIMATED GRADIENT MESH — 3 BLUE-TONE ORBS                   */}
      {/* ============================================================ */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Orb 1 — primary blue, top-left */}
        <motion.div
          className="absolute -top-40 -left-40 h-[650px] w-[650px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.04) 50%, transparent 70%)',
          }}
          animate={{ x: [0, 90, 0], y: [0, 50, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Orb 2 — cyan, center-right */}
        <motion.div
          className="absolute -right-24 top-1/4 h-[520px] w-[520px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(6,182,212,0.14) 0%, rgba(6,182,212,0.03) 50%, transparent 70%)',
          }}
          animate={{ x: [0, -70, 0], y: [0, 90, 0], scale: [1.05, 0.92, 1.05] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Orb 3 — teal, bottom-center */}
        <motion.div
          className="absolute -bottom-44 left-1/3 h-[560px] w-[560px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(20,184,166,0.11) 0%, rgba(20,184,166,0.02) 50%, transparent 70%)',
          }}
          animate={{ x: [0, 50, -30, 0], y: [0, -50, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ============================================================ */}
      {/*  DOT GRID OVERLAY                                             */}
      {/* ============================================================ */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        {dots.map((d) => (
            <div
              key={d.id}
              className="absolute rounded-full bg-white"
              style={{
                width: d.size,
                height: d.size,
                left: `${d.x}%`,
                top: `${d.y}%`,
                opacity: d.opacity,
              }}
            />
        ))}
      </div>

      {/* Radial vignette for depth */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(3,7,18,0.6) 100%)',
        }}
      />

      {/* ============================================================ */}
      {/*  HERO CONTENT                                                 */}
      {/* ============================================================ */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-28 pb-20 sm:pt-36">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOut }}
        >
          {/* ---- Shield icon with pulsing glow ---- */}
          <div className="relative mb-10 inline-flex items-center justify-center">
            {/* Pulse ring — outer */}
            <motion.div
              className="absolute rounded-2xl border border-accent/20"
              style={{ width: 80, height: 80, inset: 0, margin: 'auto' }}
              animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
            />
            {/* Pulse ring — inner */}
            <motion.div
              className="absolute rounded-2xl border border-accent/30"
              style={{ width: 80, height: 80, inset: 0, margin: 'auto' }}
              animate={{ scale: [1, 1.3, 1.3], opacity: [0.7, 0, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.6,
              }}
            />
            {/* Glass container */}
            <motion.div
              className="relative z-10 rounded-2xl glass-card p-5"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(59,130,246,0.1), 0 0 60px rgba(59,130,246,0.05)',
                  '0 0 32px rgba(59,130,246,0.25), 0 0 80px rgba(59,130,246,0.1)',
                  '0 0 20px rgba(59,130,246,0.1), 0 0 60px rgba(59,130,246,0.05)',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Shield className="h-12 w-12 text-accent" strokeWidth={1.5} />
            </motion.div>
          </div>

          {/* ---- Title ---- */}
          <h1 className="text-6xl font-bold tracking-tight text-foreground sm:text-8xl">
            Push
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #22d3ee 100%)',
              }}
            >
              Back
            </span>
          </h1>

          {/* ---- Tagline ---- */}
          <motion.p
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          >
            Understand your contract. Practice the conversation.
            <br className="hidden sm:inline" />
            <span className="font-medium text-foreground/85">
              {' '}
              Leave with confidence.
            </span>
          </motion.p>

          {/* ---- CTA Buttons ---- */}
          <motion.div
            className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
          >
            {/* Primary CTA — green */}
            <Link
              href="/login"
              className="group relative inline-flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-xl bg-safe px-9 py-4 text-base font-semibold text-white shadow-lg shadow-safe/20 transition-all duration-300 hover:bg-safe/90 hover:shadow-[0_0_30px_rgba(34,197,94,0.3),0_0_60px_rgba(34,197,94,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-safe focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {/* Shimmer sweep */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">Get Started Free</span>
              <ArrowRight className="relative h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            {/* Secondary CTA — glass outline */}
            <button
              type="button"
              className="group inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-8 py-4 text-base font-medium text-foreground/80 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={() => {
                document
                  .getElementById('features')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>See How It Works</span>
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
            </button>
          </motion.div>
        </motion.div>

        {/* ============================================================ */}
        {/*  STATS ROW                                                    */}
        {/* ============================================================ */}
        <motion.div
          className="mx-auto mt-20 grid max-w-2xl grid-cols-3 gap-4 sm:gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: easeOut }}
        >
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="glass-card rounded-xl px-4 py-5 text-center sm:px-6"
            >
              <div className="text-lg font-bold text-foreground sm:text-xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-muted/60 sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ============================================================ */}
        {/*  FEATURE CARDS                                                */}
        {/* ============================================================ */}
        <div
          id="features"
          className="mt-28 grid gap-6 sm:grid-cols-3 sm:gap-8"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group relative cursor-pointer rounded-2xl glass-card gradient-border p-7 transition-colors duration-300 sm:p-8"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.9 + i * 0.15,
                duration: 0.6,
                ease: easeOut,
              }}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
            >
              {/* Hover glow that follows cursor position (via CSS --mouse-x/y if wired, else centered) */}
              <div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(320px circle at 50% 50%, ${feature.glowColor}, transparent 60%)`,
                }}
              />

              {/* Icon */}
              <div
                className={`relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconBg}`}
              >
                <feature.icon
                  className={`h-6 w-6 ${feature.iconColor}`}
                  strokeWidth={1.5}
                />
              </div>

              {/* Step label */}
              <div className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted/40">
                Step {i + 1}
              </div>

              <h3 className="text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/*  FOOTER                                                       */}
      {/* ============================================================ */}
      <footer className="relative z-10 border-t border-white/5 mt-32">
        <div className="mx-auto max-w-5xl px-6 py-16">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <Shield className="h-4 w-4 text-accent" strokeWidth={1.5} />
              </div>
              <span
                className="text-lg font-bold bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #22d3ee 100%)',
                }}
              >
                PushBack
              </span>
            </Link>
            <p className="text-sm text-muted/60 max-w-md">
              Built for immigrants, gig workers, renters &mdash; anyone
              who&rsquo;s never been taught to push back.
            </p>
          </div>

          {/* Links row */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted/50">
            <Link
              href="/pricing"
              className="transition-colors duration-200 hover:text-foreground/80"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="transition-colors duration-200 hover:text-foreground/80"
            >
              Sign In
            </Link>
            <a
              href="#features"
              className="transition-colors duration-200 hover:text-foreground/80"
            >
              Features
            </a>
          </div>

          {/* Bottom copyright */}
          <div className="mt-8 text-center text-xs text-muted/30">
            &copy; 2026 PushBack. Not legal advice.
          </div>
        </div>
      </footer>
    </div>
  );
}
