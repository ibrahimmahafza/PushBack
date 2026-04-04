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
    <div className="relative min-h-[calc(100vh-4rem)] bg-yellow-50">
      {/* Main content */}
      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-20">
        {/* Welcome section */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/60 px-4 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse" />
            <span className="text-xs font-medium text-muted">AI Contract Analysis</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Welcome back,{' '}
            <span className="text-blue-600">{firstName}</span>
          </h2>

          <p className="mt-4 text-base text-muted leading-relaxed max-w-xl mx-auto">
            Upload a contract to get AI-powered pushback suggestions,
            negotiation scripts, and clause-by-clause analysis.
          </p>
        </div>

        {/* Contract upload / analysis section */}
        <ContractSection />

        {/* Trust footer */}
        <div className="mt-10 flex items-center justify-center gap-6 text-xs text-muted/60">
          <span className="flex items-center gap-1.5">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Encrypted
          </span>
          <span className="h-3 w-px bg-black/10" />
          <span>Files are not stored</span>
          <span className="h-3 w-px bg-black/10" />
          <span>Powered by Claude</span>
        </div>
      </div>
    </div>
  );
}
