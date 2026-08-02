import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { can } from '@/lib/permissions';

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  columnId: z.string().optional(),
  order: z.number().int().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = updateTaskSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const existing = await prisma.task.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: existing.projectId, userId: session.user.id } },
  });
  if (!membership) return NextResponse.json({ error: 'Not a member of this project' }, { status: 403 });

  const { dueDate, ...rest } = parsed.data;

  // If assigning to someone other than self, only managers/admins may do so
  // (an employee can still move their own tasks between columns freely).
  const role = (session.user as { role?: string }).role ?? 'EMPLOYEE';
  if (rest.assigneeId && rest.assigneeId !== session.user.id && !can.assignTasks(role as never)) {
    return NextResponse.json({ error: 'Only managers can assign tasks to others' }, { status: 403 });
  }

  const task = await prisma.task.update({
    where: { id: params.id },
    data: { ...rest, ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}) },
    include: { assignee: true, labels: { include: { label: true } } },
  });

  if (rest.assigneeId && rest.assigneeId !== existing.assigneeId && rest.assigneeId !== session.user.id) {
    await prisma.notification.create({
      data: {
        type: 'TASK_ASSIGNED',
        message: `${session.user.name} assigned you to "${task.title}"`,
        link: `/projects/${existing.projectId}`,
        recipientId: rest.assigneeId,
      },
    });
  }

  return NextResponse.json(task);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await prisma.task.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  const role = (session.user as { role?: string }).role ?? 'EMPLOYEE';
  const isOwnTask = existing.creatorId === session.user.id;
  if (!isOwnTask && !can.assignTasks(role as never)) {
    return NextResponse.json({ error: 'Not allowed to delete this task' }, { status: 403 });
  }

  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
