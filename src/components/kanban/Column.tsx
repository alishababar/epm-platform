'use client';

import { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BoardColumn, BoardTask } from '@/types/kanban';
import { SortableTaskCard } from './TaskCard';

interface KanbanColumnProps {
  column: BoardColumn;
  onTaskClick: (task: BoardTask) => void;
  children?: ReactNode;
}

export function KanbanColumn({ column, onTaskClick, children }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl border border-surface-border bg-surface-raised">
      <div className="flex items-center justify-between border-b border-surface-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: column.color }} />
          <span className="text-sm font-medium text-slate-200">{column.name}</span>
        </div>
        <span className="text-xs text-slate-500">{column.tasks.length}</span>
      </div>

      <div ref={setNodeRef} className="flex min-h-[120px] flex-1 flex-col gap-2 p-2">
        <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
      </div>

      <div className="p-2 pt-0">{children}</div>
    </div>
  );
}
