import Link from 'next/link';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { can } from '@/lib/permissions';
import { Navbar } from '@/components/layout/Navbar';
import { NewProjectButton } from '@/components/projects/NewProjectButton';

export default async function ProjectsPage() {
  const session = await requireSession();
  const role = (session.user as { role?: string }).role ?? 'EMPLOYEE';

  const projects = await prisma.project.findMany({
    where: role === 'ADMIN' ? {} : { members: { some: { userId: session.user.id } } },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { tasks: true, members: true } }, owner: true },
  });

  return (
    <>
      <Navbar title="Projects" userName={session.user.name} />
      <main className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-400">{projects.length} project(s)</p>
          {can.createProject(role as never) && <NewProjectButton />}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
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
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                {p.description ?? 'No description'}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                {p._count.tasks} tasks · {p._count.members} members · Owner {p.owner.name}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
