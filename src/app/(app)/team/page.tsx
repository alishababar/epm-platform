import { requireAdmin } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/Navbar';
import { RoleSelector } from '@/components/team/RoleSelector';

export default async function TeamPage() {
  const session = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, email: true, role: true },
  });

  return (
    <>
      <Navbar title="Team" userName={session.user.name} />
      <main className="p-6">
        <div className="overflow-hidden rounded-xl border border-surface-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-raised text-left text-xs text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-surface-border">
                  <td className="px-4 py-2.5 text-slate-100">{u.name}</td>
                  <td className="px-4 py-2.5 text-slate-400">{u.email}</td>
                  <td className="px-4 py-2.5">
                    <RoleSelector userId={u.id} currentRole={u.role} disabled={u.id === session.user.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
