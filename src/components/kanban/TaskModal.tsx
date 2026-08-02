'use client';

import { useEffect, useState } from 'react';
import { X, Trash2, Paperclip } from 'lucide-react';
import { BoardTask, BoardUser } from '@/types/kanban';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CommentThread } from './CommentThread';
import { can } from '@/lib/permissions';

interface TaskModalProps {
  task: BoardTask | null;
  projectId: string;
  columnId: string | undefined;
  members: BoardUser[];
  currentUserId: string;
  role: string;
  onClose: () => void;
  onSaved: (task: BoardTask) => void;
  onDeleted: (taskId: string) => void;
}

export function TaskModal({
  task,
  projectId,
  columnId,
  members,
  currentUserId,
  role,
  onClose,
  onSaved,
  onDeleted,
}: TaskModalProps) {
  const isNew = !task;
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState(task?.priority ?? 'MEDIUM');
  const [assigneeId, setAssigneeId] = useState(task?.assignee?.id ?? '');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ''
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  async function handleSave() {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError('');

    const payload = {
      title,
      description: description || null,
      priority,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
      columnId,
      projectId,
    };

    const res = await fetch(isNew ? '/api/tasks' : `/api/tasks/${task!.id}`, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Could not save task.');
      return;
    }
    onSaved(await res.json());
  }

  async function handleDelete() {
    if (!task) return;
    if (!confirm('Delete this task? This cannot be undone.')) return;
    const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
    if (res.ok) onDeleted(task.id);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !task) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', task.id);
    await fetch('/api/upload', { method: 'POST', body: formData }).catch(() => {});
    setUploading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-surface-border bg-surface-raised">
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-3">
          <h2 className="text-sm font-medium text-slate-300">{isNew ? 'New task' : 'Edit task'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <Input
            label="Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
          />

          <div className="mt-4 flex flex-col gap-1.5">
            <label className="text-sm text-slate-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
              placeholder="Add more detail…"
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-slate-300">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-400"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-slate-300">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                disabled={!can.assignTasks(role as never) && assigneeId !== currentUserId}
                className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-400 disabled:opacity-50"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <Input
              label="Due date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {!isNew && task && (
            <>
              <div className="mt-5 border-t border-surface-border pt-4">
                <label className="mb-2 flex w-fit cursor-pointer items-center gap-2 text-sm text-brand-300 hover:underline">
                  <Paperclip size={14} />
                  {uploading ? 'Uploading…' : 'Attach a file'}
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>

              <div className="mt-2 border-t border-surface-border pt-4">
                <CommentThread taskId={task.id} currentUserId={currentUserId} />
              </div>
            </>
          )}

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>

        <div className="flex items-center justify-between border-t border-surface-border px-5 py-3">
          {!isNew ? (
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 size={14} /> Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : isNew ? 'Create task' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
