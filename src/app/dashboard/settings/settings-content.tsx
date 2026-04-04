'use client';

import { motion } from 'motion/react';
import { User, Mail, Shield, Bell, Moon, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface SettingsContentProps {
  displayName: string;
  email: string;
  provider: string;
  avatarUrl: string | null;
}

function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
        enabled ? 'bg-accent' : 'bg-white/10'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function SettingsContent({
  displayName,
  email,
  provider,
  avatarUrl,
}: SettingsContentProps) {
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const providerLabel =
    provider === 'google'
      ? 'Google'
      : provider === 'github'
        ? 'GitHub'
        : provider.charAt(0).toUpperCase() + provider.slice(1);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, var(--color-accent), transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full opacity-[0.02]"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.6), transparent 70%)' }}
        />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Settings
          </h2>
          <p className="mt-2 text-sm text-muted">
            Manage your account and preferences.
          </p>
        </motion.div>

        {/* ── Profile Section ── */}
        <motion.div
          className="mt-8 glass-card rounded-2xl p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted/60">
            <User className="h-4 w-4" />
            Profile
          </h3>

          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="h-16 w-16 rounded-full ring-2 ring-white/10"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-lg font-bold text-accent">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-foreground">{displayName}</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{email}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted">
                <Shield className="h-3.5 w-3.5 shrink-0" />
                <span>Signed in with {providerLabel}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Change Password Section ── */}
        <motion.div
          className="mt-4 glass-card rounded-2xl p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted/60">
            <Shield className="h-4 w-4" />
            Security
          </h3>

          <p className="text-sm text-muted leading-relaxed">
            Password changes are managed through your{' '}
            <span className="font-medium text-foreground">{providerLabel} account</span>.
            Visit your {providerLabel} security settings to update your password or enable
            two-factor authentication.
          </p>
        </motion.div>

        {/* ── Preferences Section ── */}
        <motion.div
          className="mt-4 glass-card rounded-2xl p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted/60">
            <Bell className="h-4 w-4" />
            Preferences
          </h3>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
                  <Bell className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Email Notifications</p>
                  <p className="text-xs text-muted">Get notified about new features and updates</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={emailNotifications}
                onToggle={() => setEmailNotifications((v) => !v)}
              />
            </div>

            <div className="h-px bg-black/[0.06]" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
                  <Moon className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Dark Mode</p>
                  <p className="text-xs text-muted">Always use dark theme</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={darkMode}
                onToggle={() => setDarkMode((v) => !v)}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Danger Zone ── */}
        <motion.div
          className="mt-4 rounded-2xl border border-danger/20 bg-danger/[0.03] p-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-danger/60">
            <Trash2 className="h-4 w-4" />
            Danger Zone
          </h3>

          <p className="text-sm text-muted leading-relaxed">
            Once you delete your account, there is no going back. All your data will be
            permanently removed.
          </p>

          <button
            type="button"
            className="mt-4 cursor-pointer rounded-xl border border-danger/30 bg-danger/10 px-5 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger/20"
          >
            Delete Account
          </button>
        </motion.div>
      </div>
    </div>
  );
}
