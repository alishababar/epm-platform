import { requireManager } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/Navbar';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';

export default async function AnalyticsPage() {
  const session = await requireManager();
  const role = (session.user as { role?: string }).role ?? 'EMPLOYEE';

  const projectFilter = role === 'ADMIN' ? {} : { members: { some: { userId: session.user.id } } };

  const [tasksByColumn, tasksByPriority, sprintCounts, totalTasks, overdueTasks] = await Promise.all([
    prisma.task.groupBy({
      by: ['columnId'],
      where: { project: projectFilter },
      _count: true,
    }),
    prisma.task.groupBy({
      by: ['priority'],
      where: { project: projectFilter },
      _count: true,
    }),
    prisma.sprint.groupBy({
      by: ['status'],
      where: { project: projectFilter },
      _count: true,
    }),
    prisma.task.count({ where: { project: projectFilter } }),
    prisma.task.count({
      where: { project: projectFilter, dueDate: { lt: new Date() }, column: { name: { not: 'Done' } } },
    }),
  ]);

  const columns = await prisma.column.findMany({
    where: { id: { in: tasksByColumn.map((t) => t.columnId) } },
    select: { id: true, name: true },
  });
  const columnNameById = new Map(columns.map((c) => [c.id, c.name]));

  const statusData = tasksByColumn.map((t) => ({
    name: columnNameById.get(t.columnId) ?? 'Unknown',
    value: t._count,
  }));

  const priorityData = tasksByPriority.map((t) => ({ name: t.priority, value: t._count }));
  const sprintData = sprintCounts.map((s) => ({ name: s.status, value: s._count }));

  return (
    <>
      <Navbar title="Analytics" userName={session.user.name} />
      <main className="p-6">
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total tasks" value={totalTasks} />
          <StatCard label="Overdue" value={overdueTasks} accent={overdueTasks > 0} />
          <StatCard label="Active sprints" value={sprintCounts.find((s) => s.status === 'ACTIVE')?._count ?? 0} />
          <StatCard label="Columns tracked" value={columns.length} />
        </div>

        <AnalyticsCharts statusData={statusData} priorityData={priorityData} sprintData={sprintData} />
      </main>
    </>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent ? 'text-red-400' : 'text-slate-100'}`}>{value}</p>
    </div>
  );
}
