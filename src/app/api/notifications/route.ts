import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { recipientId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json(notifications);
}

export async function PATCH(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, markAllRead } = await req.json();

  if (markAllRead) {
    await prisma.notification.updateMany({
      where: { recipientId: session.user.id, read: false },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  }

  if (id) {
    await prisma.notification.updateMany({
      where: { id, recipientId: session.user.id },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'id or markAllRead is required' }, { status: 400 });
}
