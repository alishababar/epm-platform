import { requireSession } from '@/lib/session';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const role = (session.user as { role?: string }).role ?? 'EMPLOYEE';

  return (
    <div className="flex">
      <Sidebar role={role} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
