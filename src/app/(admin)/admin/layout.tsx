import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AdminLayoutShell from './AdminLayoutShell';

export default async function AdminServerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If there's no active session, redirect to the login page
  if (!session) {
    redirect('/login');
  }

  // Fetch user profile to verify the admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role, avatar_url')
    .eq('id', session.user.id)
    .single();

  // If the profile does not exist or user is not an admin, redirect to unauthorized page
  if (!profile || profile.role !== 'admin') {
    redirect('/unauthorized');
  }

  return (
    <AdminLayoutShell
      profile={{
        full_name: profile.full_name,
        email: profile.email,
        role: profile.role,
        avatar_url: profile.avatar_url,
      }}
    >
      {children}
    </AdminLayoutShell>
  );
}
