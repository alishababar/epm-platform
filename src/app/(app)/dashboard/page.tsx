import Link from 'next/link';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/Navbar';

export default async function DashboardPage() {
  const session = await requireSession();
  const userId = session.user.id;

  const [myTasks, myProjects] = await Promise.all([
    prisma.task.findMany({
      where: { assigneeId: userId },
      orderBy: { dueDate: 'asc' },
      take: 8,
      include: { project: true, column: true },
    }),
    prisma.project.findMany({
      where: { members: { some: { userId } }, archived: false },
      take: 6,
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { tasks: true, members: true } } },
    }),
  ]);

  return (
    <>
      <Navbar title="Dashboard" userName={session.user.name} />
      <main className="p-6">
        <section>
          <h2 className="mb-3 text-sm font-medium text-slate-400">Your projects</h2>
          {myProjects.length === 0 ? (
            <p className="text-sm text-slate-500">
              You're not on any projects yet. Ask a manager to add you, or{' '}
              <Link href="/projects" className="text-brand-300 hover:underline">
                browse projects
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="rounded-xl border border-surface-border bg-surface-raised p-4 transition-colors hover:border-brand-500"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-100">{p.name}</span>
                    <span className="rounded bg-surface-border px-1.5 py-0.5 text-xs text-slate-400">
                      {p.key}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {p._count.tasks} tasks · {p._count.members} members
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-medium text-slate-400">Assigned to you</h2>
          {myTasks.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing assigned to you right now.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-surface-border">
              <table className="w-full text-sm">
                <thead className="bg-surface-raised text-left text-xs text-slate-400">
                  <tr>
                    <th className="px-4 py-2 font-medium">Task</th>
                    <th className="px-4 py-2 font-medium">Project</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {myTasks.map((t) => (
                    <tr key={t.id} className="border-t border-surface-border">
                      <td className="px-4 py-2.5 text-slate-100">
                        <Link href={`/projects/${t.projectId}`} className="hover:underline">
                          {t.title}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-slate-400">{t.project.name}</td>
                      <td className="px-4 py-2.5 text-slate-400">{t.column.name}</td>
                      <td className="px-4 py-2.5 text-slate-400">
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
