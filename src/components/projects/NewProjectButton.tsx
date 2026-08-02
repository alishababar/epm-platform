'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function NewProjectButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, key: key.toUpperCase(), description }),
    });

    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Could not create project.');
      return;
    }
    setOpen(false);
    setName('');
    setKey('');
    setDescription('');
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus size={15} /> New project
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-surface-border bg-surface-raised p-6">
            <h2 className="text-base font-semibold text-slate-100">New project</h2>
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
              <Input
                label="Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Platform Redesign"
              />
              <Input
                label="Key"
                required
                maxLength={6}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="PLAT"
              />
              <Input
                label="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project about?"
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="mt-2 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating…' : 'Create project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
