import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ContractSection from './contract-section';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    'User';

  const firstName = displayName.split(' ')[0];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* ── Ambient background effects ── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Top-left glow orb */}
        <div
          className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, var(--color-accent), transparent 70%)',
          }}
        />
        {/* Bottom-right glow orb */}
        <div
          className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full opacity-[0.02]"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.6), transparent 70%)',
          }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Main content ── */}
      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-20">
        {/* ── Welcome section ── */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse" />
            <span className="text-xs font-medium text-muted">AI Contract Analysis</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Welcome back,{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, var(--color-foreground), var(--color-accent-light))',
              }}
            >
              {firstName}
            </span>
          </h2>

          <p className="mt-4 text-base text-muted leading-relaxed max-w-xl mx-auto">
            Upload a contract to get AI-powered pushback suggestions,
            negotiation scripts, and clause-by-clause analysis.
          </p>
        </div>

        {/* ── Contract upload / analysis section ── */}
        <ContractSection />

        {/* ── Trust footer ── */}
        <div className="mt-10 flex items-center justify-center gap-6 text-xs text-muted/30">
          <span className="flex items-center gap-1.5">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Encrypted
          </span>
          <span className="h-3 w-px bg-white/[0.06]" />
          <span>Files are not stored</span>
          <span className="h-3 w-px bg-white/[0.06]" />
          <span>Powered by Claude</span>
        </div>
      </div>
    </div>
  );
}
