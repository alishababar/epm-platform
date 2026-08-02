import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).nullable().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  columnId: z.string(),
  projectId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = createTaskSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { title, description, priority, assigneeId, dueDate, columnId, projectId } = parsed.data;

  // Confirm the user is a member of the project before letting them create a task in it.
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: session.user.id } },
  });
  if (!membership) return NextResponse.json({ error: 'Not a member of this project' }, { status: 403 });

  const lastTask = await prisma.task.findFirst({
    where: { columnId },
    orderBy: { order: 'desc' },
  });

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority,
      assigneeId,
      dueDate: dueDate ? new Date(dueDate) : null,
      columnId,
      projectId,
      creatorId: session.user.id,
      order: (lastTask?.order ?? -1) + 1,
    },
    include: { assignee: true, labels: { include: { label: true } } },
  });

  if (assigneeId && assigneeId !== session.user.id) {
    await prisma.notification.create({
      data: {
        type: 'TASK_ASSIGNED',
        message: `${session.user.name} assigned you to "${title}"`,
        link: `/projects/${projectId}`,
        recipientId: assigneeId,
      },
    });
  }

  await prisma.activityLog.create({
    data: { action: 'task.created', projectId, userId: session.user.id, metadata: { taskId: task.id } },
  });

  return NextResponse.json(task, { status: 201 });
}
