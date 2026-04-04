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
  Scan,
  BookOpen,
  Target,
  HeartHandshake,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BackgroundGradient } from '@/components/ui/BackgroundGradient';

/* ------------------------------------------------------------------ */
/*  Marquee component                                                  */
/* ------------------------------------------------------------------ */
function Marquee({
  children,
  reverse = false,
  className = '',
}: {
  children: React.ReactNode;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex overflow-hidden [--gap:0.75rem] gap-[var(--gap)]', className)}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'flex shrink-0 gap-[var(--gap)] animate-marquee',
            reverse && '[animation-direction:reverse]',
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const marqueeData = [
  "What does this non-compete actually mean?",
  "Can I negotiate my termination clause?",
  "Is this IP assignment standard?",
  "What are my rights as a contractor?",
  "How do I push back on unfair terms?",
  "What's a reasonable notice period?",
  "Is this confidentiality clause too broad?",
  "Can they really enforce this?",
  "What leverage do I have here?",
  "How do I protect my side projects?",
  "What should I ask for instead?",
  "Is this contract normal for my industry?",
];

const features = [
  {
    icon: Scan,
    title: 'We break it down',
    description: 'Every clause analyzed and rated by severity. Red for dangerous, amber for concerning, green for fair. No legal jargon.',
  },
  {
    icon: Target,
    title: 'We find your leverage',
    description: 'AI identifies the three most important clauses to fight and gives you specific angles to negotiate each one.',
  },
  {
    icon: BookOpen,
    title: 'We coach you through it',
    description: 'Practice negotiating against a realistic AI counterparty. Get real-time coaching notes after every exchange.',
  },
  {
    icon: HeartHandshake,
    title: 'With you all the way',
    description: 'From your first read-through to walking into the meeting with a ready-to-use script. We build your confidence.',
  },
];

const steps = [
  {
    icon: FileText,
    title: 'Upload Your Contract',
    description: 'Drop a PDF or paste text. AI extracts every clause and rates it by severity.',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    bullets: ['PDF & text support', 'Severity-coded clauses'],
  },
  {
    icon: Swords,
    title: 'Practice Negotiating',
    description: 'Spar against an AI counterparty who responds like a real HR manager, landlord, or client.',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    bullets: ['Realistic AI counterparty', 'Real-time coaching notes'],
  },
  {
    icon: ScrollText,
    title: 'Get Your Script',
    description: 'Walk away with exact phrases to say, ask, and insist on. Personalized from your sparring session.',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    bullets: ['Ready-to-use phrases', 'Tone & delivery tips'],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.3 + i * 0.15, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function Home() {
  const m1 = marqueeData.slice(0, 4);
  const m2 = marqueeData.slice(4, 8);
  const m3 = marqueeData.slice(8);

  return (
    <BackgroundGradient className="min-h-screen">
      {/* ── NAV ── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-6xl px-6 pt-4">
          <nav className="flex items-center justify-between rounded-2xl bg-white/60 backdrop-blur-xl border border-black/[0.04] px-6 py-3 shadow-sm">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
                <Shield className="h-4 w-4 text-yellow-50" strokeWidth={1.5} />
              </div>
              <span className="text-lg font-semibold text-foreground">
                Push<span className="text-orange-600">Back</span>
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-6">
              <a href="#features" className="text-sm text-muted hover:text-foreground transition-colors">Features</a>
              <Link href="/pricing" className="text-sm text-muted hover:text-foreground transition-colors">Pricing</Link>
            </div>
            <Link
              href="/login"
              className="rounded-full bg-black px-5 py-2 text-sm font-medium text-yellow-50 transition-all hover:bg-neutral-800"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative pt-32 sm:pt-44 pb-20">
        <div className="mx-auto max-w-5xl px-5 md:px-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium"
            >
              <Sparkles className="h-4 w-4" />
              Powered by Claude Sonnet 4.5
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="max-w-4xl font-medium text-4xl sm:text-5xl lg:text-6xl text-foreground leading-tight"
            >
              Removing the roadblocks between you and a fair contract
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="max-w-xl text-base md:text-lg text-muted"
            >
              Upload any contract. Get severity-coded analysis in seconds. Practice
              negotiating with AI. Leave with a ready-to-use script.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row gap-3 pt-4"
            >
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 rounded-full bg-black px-8 py-4 text-base font-semibold text-yellow-50 transition-all hover:bg-neutral-800 hover:shadow-lg"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-8 py-4 text-base font-semibold text-foreground hover:bg-white/80 transition-all cursor-pointer"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See How It Works
                <ChevronDown className="h-4 w-4" />
              </button>
            </motion.div>
          </div>

          {/* ── MARQUEE ── */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="relative mx-auto max-w-3xl overflow-hidden mt-16"
          >
            <div className="absolute left-0 z-10 h-full w-20 bg-gradient-to-r from-yellow-50" />
            <div className="absolute right-0 z-10 h-full w-20 bg-gradient-to-l from-yellow-50" />
            <div className="flex flex-col gap-2">
              <Marquee className="[--duration:45s]">
                {m1.map((q) => (
                  <span key={q} className="shrink-0 rounded-md border border-[#e5e2b8] bg-[#edebbe] px-3 py-1.5 text-sm text-foreground/80">
                    {q}
                  </span>
                ))}
              </Marquee>
              <Marquee className="[--duration:50s]" reverse>
                {m2.map((q) => (
                  <span key={q} className="shrink-0 rounded-md border border-[#e5e2b8] bg-[#edebbe] px-3 py-1.5 text-sm text-foreground/80">
                    {q}
                  </span>
                ))}
              </Marquee>
              <Marquee className="[--duration:42s]">
                {m3.map((q) => (
                  <span key={q} className="shrink-0 rounded-md border border-[#e5e2b8] bg-[#edebbe] px-3 py-1.5 text-sm text-foreground/80">
                    {q}
                  </span>
                ))}
              </Marquee>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES (4-col with dashed borders, matching reference) ── */}
      <section id="features" className="relative border-t border-dashed border-neutral-300/60">
        <div className="mx-auto max-w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-dashed divide-neutral-400 sm:divide-x">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="flex flex-col gap-5 px-5 py-8 lg:px-6 lg:py-10"
                >
                  <Icon className="size-12 text-neutral-700" strokeWidth={1} />
                  <div className="flex flex-col gap-2 pt-10 lg:pt-20">
                    <h3 className="font-medium text-2xl tracking-tight sm:text-3xl text-foreground">
                      {feature.title}
                    </h3>
                    <p className="leading-relaxed text-muted">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (3 step cards) ── */}
      <section className="relative py-20 border-t border-dashed border-neutral-300/60">
        <div className="mx-auto max-w-5xl px-5 md:px-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center font-medium text-3xl sm:text-4xl text-foreground mb-12"
          >
            Three steps to confidence
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="rounded-2xl border border-black/[0.06] bg-white/50 backdrop-blur-md p-6 hover:shadow-md hover:bg-white/70 transition-all"
              >
                <div className={cn('flex items-center justify-center w-12 h-12 rounded-xl mb-5', step.iconBg)}>
                  <step.icon className={cn('w-6 h-6', step.iconColor)} strokeWidth={1.5} />
                </div>
                <div className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted/60">
                  Step {i + 1}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted mb-4 text-sm leading-relaxed">{step.description}</p>
                <ul className="space-y-2">
                  {step.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-muted">
                      <CheckCircle2 className={cn('w-4 h-4 flex-shrink-0', step.iconColor)} />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative border-t border-dashed border-neutral-300/60">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
                <Shield className="h-4 w-4 text-yellow-50" strokeWidth={1.5} />
              </div>
              <span className="text-lg font-semibold text-foreground">
                Push<span className="text-orange-600">Back</span>
              </span>
            </Link>
            <p className="text-base font-medium text-foreground/70 mb-2">The fine print has met its match.</p>
            <p className="text-sm text-muted max-w-md">
              Built for immigrants, gig workers, renters, and anyone who has never been taught to push back.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted">
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          </div>
          <div className="mt-8 text-center text-xs text-muted/50">&copy; 2026 PushBack. Not legal advice.</div>
        </div>
      </footer>
    </BackgroundGradient>
  );
}
