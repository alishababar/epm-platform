import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { can } from '@/lib/permissions';

const createProjectSchema = z.object({
  name: z.string().min(1).max(120),
  key: z.string().min(2).max(6),
  description: z.string().max(500).optional(),
});

const DEFAULT_COLUMNS = ['Backlog', 'To Do', 'In Progress', 'In Review', 'Done'];

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as { role?: string }).role ?? 'EMPLOYEE';
  if (!can.createProject(role as never)) {
    return NextResponse.json({ error: 'Only managers and admins can create projects' }, { status: 403 });
  }

  const parsed = createProjectSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { name, key, description } = parsed.data;

  const existing = await prisma.project.findUnique({ where: { key } });
  if (existing) {
    return NextResponse.json({ error: `Key "${key}" is already in use` }, { status: 409 });
  }

  const project = await prisma.project.create({
    data: {
      name,
      key,
      description,
      ownerId: session.user.id,
      members: { create: { userId: session.user.id, role: 'OWNER' } },
      boards: {
        create: {
          name: 'Main board',
          columns: {
            create: DEFAULT_COLUMNS.map((colName, i) => ({ name: colName, order: i })),
          },
        },
      },
    },
    include: { boards: true },
  });

  return NextResponse.json(project, { status: 201 });
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as { role?: string }).role ?? 'EMPLOYEE';
  const projects = await prisma.project.findMany({
    where: role === 'ADMIN' ? {} : { members: { some: { userId: session.user.id } } },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(projects);
}
