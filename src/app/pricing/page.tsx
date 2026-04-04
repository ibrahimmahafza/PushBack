'use client';

import { motion } from 'motion/react';
import { Check, Sparkles, Zap, Building2 } from 'lucide-react';
import Link from 'next/link';
import LandingNav from '@/components/LandingNav';

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
const easeOut = [0.22, 1, 0.36, 1] as const;

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.7, delay, ease: easeOut },
  };
}

/* ------------------------------------------------------------------ */
/*  Tier data                                                          */
/* ------------------------------------------------------------------ */
const tiers = [
  {
    name: 'Starter',
    icon: Zap,
    price: '$20',
    period: '/mo',
    features: [
      '7 AI contract consultations/month',
      'Built-in negotiation sparring',
      'Clause-by-clause severity analysis',
      'Negotiation scripts',
      'Email support',
    ],
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Pro',
    icon: Sparkles,
    price: '$49',
    period: '/mo',
    badge: 'Most Popular',
    features: [
      'Everything in Starter',
      'Unlimited consultations',
      'Priority AI processing',
      'Export reports as PDF',
      { text: 'Team sharing', badge: 'Coming Soon' },
    ],
    cta: 'Start Free Trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: 'Custom',
    period: '',
    features: [
      'Everything in Pro',
      'Custom AI training',
      'API access',
      'Dedicated account manager',
      'SSO & compliance',
    ],
    cta: 'Contact Sales',
    featured: false,
  },
] as const;

/* ------------------------------------------------------------------ */
/*  FAQ data                                                           */
/* ------------------------------------------------------------------ */
const faqs = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, cancel anytime. No contracts, no hidden fees.',
  },
  {
    q: 'What counts as a consultation?',
    a: 'Each contract upload and full AI analysis counts as one consultation. Sparring sessions within that analysis are unlimited.',
  },
  {
    q: 'Is my contract data stored?',
    a: 'No. Your contract is processed in memory and never saved to any database.',
  },
  {
    q: 'Can I buy more consultations?',
    a: 'Yes! Additional consultations are $3 each, purchased on-demand.',
  },
];

/* ------------------------------------------------------------------ */
/*  Feature line component                                             */
/* ------------------------------------------------------------------ */
function FeatureLine({ feature }: { feature: string | { text: string; badge: string } }) {
  const text = typeof feature === 'string' ? feature : feature.text;
  const badge = typeof feature === 'string' ? null : feature.badge;

  return (
    <li className="flex items-start gap-3 text-sm text-foreground/70">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-safe" />
      <span>
        {text}
        {badge && (
          <span className="ml-2 inline-block rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-light">
            {badge}
          </span>
        )}
      </span>
    </li>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */
export default function PricingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* ============================================================ */}
      {/*  ANIMATED GRADIENT ORBS                                      */}
      {/* ============================================================ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute -top-40 -left-40 h-[650px] w-[650px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.04) 50%, transparent 70%)',
          }}
          animate={{ x: [0, 90, 0], y: [0, 50, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-24 top-1/4 h-[520px] w-[520px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(6,182,212,0.14) 0%, rgba(6,182,212,0.03) 50%, transparent 70%)',
          }}
          animate={{ x: [0, -70, 0], y: [0, 90, 0], scale: [1.05, 0.92, 1.05] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        />
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

      {/* Radial vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(3,7,18,0.6) 100%)',
        }}
      />

      {/* ============================================================ */}
      {/*  NAV                                                          */}
      {/* ============================================================ */}
      <LandingNav />

      {/* ============================================================ */}
      {/*  HERO                                                         */}
      {/* ============================================================ */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-32 pb-12 text-center">
        <motion.h1
          className="text-4xl font-bold tracking-tight sm:text-5xl"
          {...fadeUp(0)}
        >
          Simple, Transparent Pricing
        </motion.h1>
        <motion.p
          className="text-gradient-accent mx-auto mt-4 max-w-lg text-lg font-medium"
          {...fadeUp(0.1)}
        >
          Know what you&apos;re paying for — no surprises, no hidden clauses.
        </motion.p>
      </section>

      {/* ============================================================ */}
      {/*  PRICING CARDS                                                */}
      {/* ============================================================ */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-8 md:grid-cols-3">
          {tiers.map((tier, i) => {
            const Icon = tier.icon;
            const delay = 0.15 + i * 0.12;

            return (
              <motion.div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl p-8 ${
                  tier.featured
                    ? 'gradient-border glass-card glow-accent scale-[1.03] md:scale-105'
                    : 'glass-card-interactive'
                }`}
                {...fadeUp(delay)}
              >
                {/* Badge */}
                {tier.featured && 'badge' in tier && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="glow-accent rounded-full bg-accent px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                      {tier.badge}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                      <Icon className="h-5 w-5 text-accent-light" />
                    </div>
                    <h3 className="text-xl font-semibold">{tier.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                    {tier.period && (
                      <span className="text-sm text-muted">{tier.period}</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="mb-8 flex-1 space-y-3">
                  {tier.features.map((f, fi) => (
                    <FeatureLine key={fi} feature={f} />
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className={`w-full cursor-default rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                    tier.featured
                      ? 'bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent/90'
                      : 'border border-white/10 bg-white/[0.03] text-foreground/80 backdrop-blur-sm hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  {tier.cta}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Add-on note */}
        <motion.p
          className="mt-10 text-center text-sm text-muted"
          {...fadeUp(0.55)}
        >
          Purchase additional consultations anytime — <span className="font-semibold text-foreground/80">$3 each</span>
        </motion.p>
      </section>

      {/* ============================================================ */}
      {/*  FAQ                                                          */}
      {/* ============================================================ */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-20">
        <motion.h2
          className="mb-10 text-center text-2xl font-bold tracking-tight sm:text-3xl"
          {...fadeUp(0.6)}
        >
          Frequently Asked Questions
        </motion.h2>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className="glass-card rounded-xl p-6"
              {...fadeUp(0.65 + i * 0.08)}
            >
              <h3 className="mb-2 text-base font-semibold text-foreground/90">{faq.q}</h3>
              <p className="text-sm leading-relaxed text-muted">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BOTTOM CTA                                                   */}
      {/* ============================================================ */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-32">
        <motion.div className="text-center" {...fadeUp(1)}>
          <Link
            href="/login"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-safe px-8 py-4 text-base font-semibold text-white shadow-lg shadow-safe/20 transition-all duration-300 hover:shadow-safe/30 hover:brightness-110"
          >
            {/* Shimmer overlay */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">Start with 7 free consultations</span>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
