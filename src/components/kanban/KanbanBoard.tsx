'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { BoardColumn, BoardTask, BoardUser } from '@/types/kanban';
import { KanbanColumn } from './Column';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { Button } from '@/components/ui/Button';

interface KanbanBoardProps {
  boardId: string;
  projectId: string;
  initialColumns: BoardColumn[];
  members: BoardUser[];
  currentUserId: string;
  role: string;
}

export function KanbanBoard({
  projectId,
  initialColumns,
  members,
  currentUserId,
  role,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<BoardColumn[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null);
  const [openTask, setOpenTask] = useState<BoardTask | null>(null);
  const [creatingInColumn, setCreatingInColumn] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function findColumnOfTask(taskId: string) {
    return columns.find((c) => c.tasks.some((t) => t.id === taskId));
  }

  function handleDragStart(event: DragStartEvent) {
    const task = columns.flatMap((c) => c.tasks).find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const sourceColumn = findColumnOfTask(activeId);
    if (!sourceColumn) return;

    // Dropped over a column (empty area) or over another task
    const targetColumn = columns.find((c) => c.id === overId) ?? findColumnOfTask(overId);
    if (!targetColumn) return;

    const newColumns = columns.map((c) => ({ ...c, tasks: [...c.tasks] }));
    const sourceCol = newColumns.find((c) => c.id === sourceColumn.id)!;
    const targetCol = newColumns.find((c) => c.id === targetColumn.id)!;

    const activeIndex = sourceCol.tasks.findIndex((t) => t.id === activeId);
    const [movedTask] = sourceCol.tasks.splice(activeIndex, 1);
    movedTask.columnId = targetCol.id;

    if (sourceCol.id === targetCol.id) {
      const overIndex = targetCol.tasks.findIndex((t) => t.id === overId);
      targetCol.tasks.splice(overIndex >= 0 ? overIndex : targetCol.tasks.length, 0, movedTask);
      targetCol.tasks = arrayMove(targetCol.tasks, targetCol.tasks.indexOf(movedTask), overIndex >= 0 ? overIndex : targetCol.tasks.length - 1);
    } else {
      const overIndex = targetCol.tasks.findIndex((t) => t.id === overId);
      targetCol.tasks.splice(overIndex >= 0 ? overIndex : targetCol.tasks.length, 0, movedTask);
    }

    setColumns(newColumns);

    // Persist: new column + new order index within that column
    await fetch(`/api/tasks/${activeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        columnId: targetCol.id,
        order: targetCol.tasks.findIndex((t) => t.id === activeId),
      }),
    }).catch(() => {
      // Best-effort optimistic update; a full page refresh will resync on failure.
    });
  }

  function handleTaskUpdated(updated: BoardTask) {
    setColumns((prev) =>
      prev.map((c) => ({
        ...c,
        tasks:
          c.id === updated.columnId
            ? c.tasks.some((t) => t.id === updated.id)
              ? c.tasks.map((t) => (t.id === updated.id ? updated : t))
              : [...c.tasks, updated]
            : c.tasks.filter((t) => t.id !== updated.id),
      }))
    );
    setOpenTask(null);
    setCreatingInColumn(null);
  }

  function handleTaskDeleted(taskId: string) {
    setColumns((prev) => prev.map((c) => ({ ...c, tasks: c.tasks.filter((t) => t.id !== taskId) })));
    setOpenTask(null);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} onTaskClick={setOpenTask}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-500"
              onClick={() => setCreatingInColumn(column.id)}
            >
              <Plus size={14} /> Add task
            </Button>
          </KanbanColumn>
        ))}

        <DragOverlay>{activeTask && <TaskCard task={activeTask} dragOverlay />}</DragOverlay>
      </DndContext>

      {(openTask || creatingInColumn) && (
        <TaskModal
          task={openTask}
          projectId={projectId}
          columnId={creatingInColumn ?? openTask?.columnId ?? columns[0]?.id}
          members={members}
          currentUserId={currentUserId}
          role={role}
          onClose={() => {
            setOpenTask(null);
            setCreatingInColumn(null);
          }}
          onSaved={handleTaskUpdated}
          onDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}
