'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLES = ['EMPLOYEE', 'MANAGER', 'ADMIN'] as const;

export function RoleSelector({
  userId,
  currentRole,
  disabled,
}: {
  userId: string;
  currentRole: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [saving, setSaving] = useState(false);

  async function handleChange(newRole: string) {
    setRole(newRole);
    setSaving(true);
    const res = await fetch(`/api/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    setSaving(false);
    if (!res.ok) {
      setRole(currentRole); // revert on failure
      return;
    }
    router.refresh();
  }

  return (
    <select
      value={role}
      disabled={disabled || saving}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-surface-border bg-surface px-2 py-1 text-xs text-slate-100 outline-none focus:border-brand-400 disabled:opacity-50"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
