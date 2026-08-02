import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

const schema = z.object({ role: z.enum(['EMPLOYEE', 'MANAGER', 'ADMIN']) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admins can change roles' }, { status: 403 });
  }
  if (params.id === session.user.id) {
    return NextResponse.json({ error: "You can't change your own role" }, { status: 400 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { role: parsed.data.role },
    select: { id: true, name: true, role: true },
  });

  return NextResponse.json(user);
}
