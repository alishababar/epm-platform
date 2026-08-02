import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Minimal password hashing compatible with Better Auth's scrypt-based
// email/password provider is version-specific — for seeding, it's simplest
// to create users via the app's sign-up flow instead. This script seeds the
// domain data (project/board/tasks) against users you create manually, or
// swap in a hashed password if you know your Better Auth version's format.

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      id: randomUUID(),
      name: 'Ada Admin',
      email: 'admin@example.com',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      id: randomUUID(),
      name: 'Max Manager',
      email: 'manager@example.com',
      role: 'MANAGER',
      emailVerified: true,
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@example.com' },
    update: {},
    create: {
      id: randomUUID(),
      name: 'Evan Employee',
      email: 'employee@example.com',
      role: 'EMPLOYEE',
      emailVerified: true,
    },
  });

  const project = await prisma.project.upsert({
    where: { key: 'DEMO' },
    update: {},
    create: {
      name: 'Demo Project',
      key: 'DEMO',
      description: 'A sample project seeded for local development.',
      ownerId: manager.id,
      members: {
        create: [
          { userId: admin.id, role: 'OWNER' },
          { userId: manager.id, role: 'MANAGER' },
          { userId: employee.id, role: 'MEMBER' },
        ],
      },
      boards: {
        create: {
          name: 'Main board',
          columns: {
            create: [
              { name: 'Backlog', order: 0 },
              { name: 'To Do', order: 1 },
              { name: 'In Progress', order: 2 },
              { name: 'In Review', order: 3 },
              { name: 'Done', order: 4 },
            ],
          },
        },
      },
      sprints: {
        create: {
          name: 'Sprint 1',
          goal: 'Ship the kanban MVP',
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
        },
      },
    },
    include: { boards: { include: { columns: true } }, sprints: true },
  });

  const todoColumn = project.boards[0].columns.find((c) => c.name === 'To Do')!;
  const sprint = project.sprints[0];

  await prisma.task.createMany({
    data: [
      {
        title: 'Set up CI pipeline',
        priority: 'HIGH',
        columnId: todoColumn.id,
        projectId: project.id,
        creatorId: manager.id,
        assigneeId: employee.id,
        sprintId: sprint.id,
        order: 0,
      },
      {
        title: 'Design onboarding flow',
        priority: 'MEDIUM',
        columnId: todoColumn.id,
        projectId: project.id,
        creatorId: manager.id,
        sprintId: sprint.id,
        order: 1,
      },
    ],
  });

  console.log('Seed complete:', { admin: admin.email, manager: manager.email, employee: employee.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
