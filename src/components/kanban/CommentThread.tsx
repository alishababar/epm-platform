'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface CommentData {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string };
}

export function CommentThread({ taskId }: { taskId: string; currentUserId: string }) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetch(`/api/tasks/${taskId}/comments`)
      .then((r) => r.json())
      .then(setComments)
      .finally(() => setLoading(false));
  }, [taskId]);

  async function handlePost() {
    if (!body.trim()) return;
    setPosting(true);
    const res = await fetch(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    setPosting(false);
    if (res.ok) {
      const comment = await res.json();
      setComments((prev) => [...prev, comment]);
      setBody('');
    }
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-slate-300">Comments</h3>

      {loading ? (
        <p className="text-xs text-slate-500">Loading…</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-slate-500">No comments yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg bg-surface px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">{c.author.name}</span>
                <span className="text-[10px] text-slate-500">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-200">{c.body}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePost()}
          placeholder="Write a comment…"
          className="flex-1 rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-brand-400"
        />
        <Button size="sm" onClick={handlePost} disabled={posting}>
          Post
        </Button>
      </div>
    </div>
  );
}
