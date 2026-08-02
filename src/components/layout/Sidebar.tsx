import Link from 'next/link';
import { LayoutDashboard, KanbanSquare, BarChart3, Bell, Users } from 'lucide-react';

interface SidebarProps {
  role: string;
}

export function Sidebar({ role }: SidebarProps) {
  const canViewAnalytics = role === 'MANAGER' || role === 'ADMIN';

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { href: '/projects', label: 'Projects', icon: KanbanSquare, show: true },
    { href: '/analytics', label: 'Analytics', icon: BarChart3, show: canViewAnalytics },
    { href: '/notifications', label: 'Notifications', icon: Bell, show: true },
    { href: '/team', label: 'Team', icon: Users, show: role === 'ADMIN' },
  ];

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-surface-border bg-surface-raised px-3 py-4">
      <div className="px-2 pb-6 text-lg font-semibold text-slate-100">EPM</div>
      <nav className="flex flex-1 flex-col gap-1">
        {links
          .filter((l) => l.show)
          .map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-300 transition-colors hover:bg-surface-border hover:text-slate-100"
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
      </nav>
      <div className="px-2 pt-4 text-xs text-slate-500">Role: {role}</div>
    </aside>
  );
}
