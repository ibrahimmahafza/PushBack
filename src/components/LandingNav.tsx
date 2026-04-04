'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Menu, X } from 'lucide-react';
import Link from 'next/link';

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
        <Shield className="h-4 w-4 text-yellow-50" strokeWidth={1.5} />
      </div>
      <span className="text-lg font-semibold text-foreground">
        Push<span className="text-orange-600">Back</span>
      </span>
    </Link>
  );
}

export default function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-6xl px-6 pt-4">
        <nav className="flex items-center justify-between rounded-2xl bg-yellow-50/80 backdrop-blur-xl border border-black/[0.04] px-6 py-3 shadow-sm">
          <Logo />

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-6">
            <Link href="/#features" className="text-sm text-muted hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-muted hover:text-foreground transition-colors">
              Pricing
            </Link>
          </div>

          {/* Desktop sign-in */}
          <Link
            href="/login"
            className="hidden sm:inline-flex rounded-full bg-black px-5 py-2 text-sm font-medium text-yellow-50 transition-all hover:bg-neutral-800"
          >
            Sign In
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="sm:hidden p-2 text-muted hover:text-foreground transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </nav>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col items-center bg-yellow-50/95 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 p-2 text-muted hover:text-foreground transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Logo */}
            <div className="mt-20" onClick={() => setMobileOpen(false)}>
              <Logo />
            </div>

            {/* Nav links */}
            <nav className="mt-12 flex flex-col items-center gap-8">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Sign In', href: '/login' },
              ].map(({ label, href }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="text-2xl font-medium text-muted hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
