'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface ChartDatum {
  name: string;
  value: number;
}

const COLORS = ['#3a67b0', '#5c87c8', '#8caddb', '#b9cdea', '#2c5093', '#213864'];

export function AnalyticsCharts({
  statusData,
  priorityData,
  sprintData,
}: {
  statusData: ChartDatum[];
  priorityData: ChartDatum[];
  sprintData: ChartDatum[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ChartCard title="Tasks by column">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#232b3f" />
            <XAxis dataKey="name" stroke="#8caddb" fontSize={12} />
            <YAxis stroke="#8caddb" fontSize={12} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#161c2c', border: '1px solid #232b3f' }} />
            <Bar dataKey="value" fill="#3a67b0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Tasks by priority">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={priorityData} dataKey="value" nameKey="name" outerRadius={90} label>
              {priorityData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip contentStyle={{ background: '#161c2c', border: '1px solid #232b3f' }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Sprint status">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={sprintData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#232b3f" />
            <XAxis type="number" stroke="#8caddb" fontSize={12} allowDecimals={false} />
            <YAxis type="category" dataKey="name" stroke="#8caddb" fontSize={12} width={90} />
            <Tooltip contentStyle={{ background: '#161c2c', border: '1px solid #232b3f' }} />
            <Bar dataKey="value" fill="#5c87c8" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-4">
      <h3 className="mb-2 text-sm font-medium text-slate-300">{title}</h3>
      {children}
    </div>
  );
}
