import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

const commentSchema = z.object({ body: z.string().min(1).max(2000) });

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const comments = await prisma.comment.findMany({
    where: { taskId: params.id },
    orderBy: { createdAt: 'asc' },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = commentSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const task = await prisma.task.findUnique({ where: { id: params.id } });
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  const comment = await prisma.comment.create({
    data: { body: parsed.data.body, taskId: params.id, authorId: session.user.id },
    include: { author: { select: { id: true, name: true } } },
  });

  // Notify the assignee if someone else commented on their task.
  if (task.assigneeId && task.assigneeId !== session.user.id) {
    await prisma.notification.create({
      data: {
        type: 'COMMENT_MENTION',
        message: `${session.user.name} commented on "${task.title}"`,
        link: `/projects/${task.projectId}`,
        recipientId: task.assigneeId,
      },
    });
  }

  return NextResponse.json(comment, { status: 201 });
}
