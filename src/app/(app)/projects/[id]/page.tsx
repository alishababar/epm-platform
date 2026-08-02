import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/Navbar';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const session = await requireSession();

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      boards: {
        include: {
          columns: {
            orderBy: { order: 'asc' },
            include: {
              tasks: {
                orderBy: { order: 'asc' },
                include: { assignee: true, labels: { include: { label: true } } },
              },
            },
          },
        },
      },
      members: { include: { user: true } },
    },
  });

  if (!project) notFound();

  const board = project.boards[0];
  const role = (session.user as { role?: string }).role ?? 'EMPLOYEE';

  return (
    <>
      <Navbar title={project.name} userName={session.user.name} />
      <main className="p-6">
        {board ? (
          <KanbanBoard
            boardId={board.id}
            projectId={project.id}
            initialColumns={board.columns}
            members={project.members.map((m) => m.user)}
            currentUserId={session.user.id}
            role={role}
          />
        ) : (
          <p className="text-sm text-slate-500">This project has no board yet.</p>
        )}
      </main>
    </>
  );
}
