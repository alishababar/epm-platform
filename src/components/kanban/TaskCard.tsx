'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays } from 'lucide-react';
import { BoardTask } from '@/types/kanban';
import { cn } from '@/lib/utils';

const PRIORITY_STYLES: Record<BoardTask['priority'], string> = {
  LOW: 'bg-slate-700 text-slate-300',
  MEDIUM: 'bg-blue-900/60 text-blue-300',
  HIGH: 'bg-amber-900/60 text-amber-300',
  URGENT: 'bg-red-900/60 text-red-300',
};

interface TaskCardProps {
  task: BoardTask;
  onClick?: () => void;
  dragOverlay?: boolean;
}

export function TaskCard({ task, onClick, dragOverlay }: TaskCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-lg border border-surface-border bg-surface p-3 transition-colors hover:border-brand-500',
        dragOverlay && 'rotate-2 shadow-xl'
      )}
    >
      <p className="text-sm text-slate-100">{task.title}</p>

      {task.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.labels.map(({ label }) => (
            <span
              key={label.id}
              className="rounded px-1.5 py-0.5 text-[10px]"
              style={{ backgroundColor: `${label.color}33`, color: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between">
        <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', PRIORITY_STYLES[task.priority])}>
          {task.priority}
        </span>
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-[10px] text-slate-500">
              <CalendarDays size={11} />
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
          {task.assignee && (
            <div
              title={task.assignee.name}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-medium text-white"
            >
              {task.assignee.name.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SortableTaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}
