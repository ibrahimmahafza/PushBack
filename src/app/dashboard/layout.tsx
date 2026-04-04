import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SignOutButton from './sign-out-button';
import NavLinks from './nav-links';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  const avatarUrl = user.user_metadata?.avatar_url;
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-yellow-50/80 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
                <svg className="h-5 w-5 text-yellow-50" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-foreground">
                Push<span className="text-orange-600">Back</span>
              </span>
            </Link>
            <NavLinks />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full ring-2 ring-black/10"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                  {initials}
                </div>
              )}
              <span className="hidden text-sm text-muted sm:inline">{displayName}</span>
            </div>
            <SignOutButton />
          </div>
        </div>
        {/* Bottom line */}
        <div className="h-px bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
