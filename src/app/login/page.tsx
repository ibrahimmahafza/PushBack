'use client';

import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, AlertCircle } from 'lucide-react';

function LoginContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam ? decodeErrorMessage(errorParam) : null
  );

  function decodeErrorMessage(code: string): string {
    switch (code) {
      case 'auth_failed':
        return 'Authentication failed. Please try again.';
      case 'no_code':
        return 'Invalid authentication response. Please try again.';
      case 'session_error':
        return 'Could not establish session. Please try again.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        console.error('[login] OAuth error:', authError.message);
        setError('Failed to initiate sign-in. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('[login] Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden bg-yellow-50">
      {/* Warm background blurs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-orange-200/30 blur-[100px]"
          animate={{
            x: [0, 60, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-200/20 blur-[120px]"
          animate={{
            x: [0, -50, 0],
            y: [0, -60, 0],
            scale: [1.1, 0.9, 1.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-200/15 blur-[80px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* End bg */}

      <motion.div
        className="relative z-10 w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Branding */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            className="mb-6 inline-flex items-center justify-center rounded-2xl glass-card p-5"
            animate={{ boxShadow: ['0 0 20px rgba(194,65,12,0.1)', '0 0 40px rgba(194,65,12,0.2)', '0 0 20px rgba(194,65,12,0.1)'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Shield className="h-10 w-10 text-accent" strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Push<span className="text-orange-600">Back</span>
          </h1>
          <p className="mt-3 text-lg text-muted">
            Understand your contract. Practice pushing back.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="relative rounded-2xl bg-white/70 backdrop-blur-sm border border-black/[0.06] p-8 shadow-sm"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            boxShadow: '0 4px 40px rgba(0,0,0,0.04)',
          }}
        >
          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/50 to-transparent" />

          <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
            Sign in to continue
          </h2>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger-light"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Google sign-in button */}
          <motion.button
            onClick={handleGoogleSignIn}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm font-medium text-foreground transition-all duration-200 hover:border-black/20 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Redirecting…
              </span>
            ) : (
              'Sign in with Google'
            )}
          </motion.button>

          <p className="mt-6 text-center text-xs text-muted/60">
            By signing in, you agree to our terms of service.
          </p>
        </motion.div>

        {/* Bottom trust signal */}
        <motion.div
          className="flex items-center justify-center gap-2 text-xs text-muted/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Lock className="h-3.5 w-3.5" />
          Secured with Supabase Auth &amp; Google OAuth
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
