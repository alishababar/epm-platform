import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Use in server components/pages that require a logged-in user. */
export async function requireSession() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');
  return session;
}

/** Use in server components/pages that require MANAGER or ADMIN. */
export async function requireManager() {
  const session = await requireSession();
  const role = (session.user as { role?: string }).role;
  if (role !== 'MANAGER' && role !== 'ADMIN') redirect('/dashboard');
  return session;
}

/** Use in server components/pages that require ADMIN only. */
export async function requireAdmin() {
  const session = await requireSession();
  const role = (session.user as { role?: string }).role;
  if (role !== 'ADMIN') redirect('/dashboard');
  return session;
}
