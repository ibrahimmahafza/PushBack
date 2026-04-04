import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SettingsContent from './settings-content';

export default async function SettingsPage() {
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

  const avatarUrl = user.user_metadata?.avatar_url || null;
  const email = user.email || 'No email';
  const provider = user.app_metadata?.provider || 'email';

  return (
    <SettingsContent
      displayName={displayName}
      email={email}
      provider={provider}
      avatarUrl={avatarUrl}
    />
  );
}
