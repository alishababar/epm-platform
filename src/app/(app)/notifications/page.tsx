'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NotificationData {
  id: string;
  type: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, []);

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-base font-semibold text-slate-100">
          <Bell size={18} /> Notifications
        </h1>
        <Button variant="secondary" size="sm" onClick={markAllRead}>
          <CheckCheck size={14} /> Mark all read
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : notifications.length === 0 ? (
        <p className="text-sm text-slate-500">You're all caught up.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link ?? '#'}
              className={`rounded-lg border border-surface-border p-3 text-sm transition-colors hover:border-brand-500 ${
                n.read ? 'bg-surface-raised text-slate-400' : 'bg-surface-raised text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{n.message}</span>
                {!n.read && <span className="h-2 w-2 rounded-full bg-brand-400" />}
              </div>
              <span className="mt-1 block text-xs text-slate-500">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
