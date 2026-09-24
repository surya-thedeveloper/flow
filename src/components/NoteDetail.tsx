import React, { useState, useRef, useEffect } from 'react';
import type { Note, Task } from '../types';
import { ProgressBar } from './ProgressBar';
import { TaskItem } from './TaskItem';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface NoteDetailProps {
  note: Note;
  isDeleting?: boolean;
  onUpdateNote: (updatedNote: Note) => void;
  onDeleteNote: (noteId: string) => void;
}

export const NoteDetail: React.FC<NoteDetailProps> = ({
  note,
  isDeleting = false,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(note.title);
  const [exitingTaskId, setExitingTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isDeletingSelf, setIsDeletingSelf] = useState(false);
  const [showAllActive, setShowAllActive] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  // Smooth pointer drag reordering state
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [pointerDeltaY, setPointerDeltaY] = useState(0);
  const startYRef = useRef(0);
  const draggingIdxRef = useRef<number | null>(null);
  const pointerDeltaRef = useRef(0);

  const uncheckedTasks = note.tasks.filter((t) => !t.completed);
  const completedTasks = note.tasks.filter((t) => t.completed);
  const totalCount = note.tasks.length;
  const completedCount = completedTasks.length;

  // Show 2 unchecked items at a time by default
  const ACTIVE_LIMIT = 2;
  const displayedActiveTasks = showAllActive
    ? uncheckedTasks
    : uncheckedTasks.slice(0, ACTIVE_LIMIT);

  const ITEM_HEIGHT = 48; // approximate row height in pixels

  const handleTitleBlur = () => {
    const trimmed = titleText.trim();
    if (trimmed && trimmed !== note.title) {
      onUpdateNote({
        ...note,
        title: trimmed,
        updatedAt: Date.now(),
      });
    } else {
      setTitleText(note.title);
    }
    setIsEditingTitle(false);
  };

  const handleToggleTask = (taskId: string) => {
    const task = note.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const now = Date.now();
    if (!task.completed) {
      setExitingTaskId(taskId);
      setTimeout(() => {
        const updatedTasks = note.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: true } : t
        );
        onUpdateNote({
          ...note,
          tasks: updatedTasks,
          updatedAt: now,
          lastFlowAt: now,
        });
        setExitingTaskId(null);
      }, 240);
    } else {
      const updatedTasks = note.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: false } : t
      );
      onUpdateNote({
        ...note,
        tasks: updatedTasks,
        updatedAt: now,
        lastFlowAt: now,
      });
    }
  };

  const handleUpdateTaskTitle = (taskId: string, newTitle: string) => {
    const updatedTasks = note.tasks.map((t) =>
      t.id === taskId ? { ...t, title: newTitle } : t
    );
    onUpdateNote({
      ...note,
      tasks: updatedTasks,
      updatedAt: Date.now(),
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setDeletingTaskId(taskId);
    setTimeout(() => {
      const updatedTasks = note.tasks.filter((t) => t.id !== taskId);
      onUpdateNote({
        ...note,
        tasks: updatedTasks,
        updatedAt: Date.now(),
      });
      setDeletingTaskId(null);
    }, 220);
  };

  const handleDeleteNoteClick = () => {
    if (isDeletingSelf || isDeleting) return;
    setIsDeletingSelf(true);
    setTimeout(() => {
      onDeleteNote(note.id);
      setIsDeletingSelf(false);
    }, 260);
  };

  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTaskText.trim();
    if (!trimmed) return;

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: trimmed,
      completed: false,
      createdAt: Date.now(),
    };

    onUpdateNote({
      ...note,
      tasks: [...note.tasks, newTask],
      updatedAt: Date.now(),
    });
    setNewTaskText('');
  };

  // Pointer drag start
  const handlePointerDragStart = (e: React.PointerEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    startYRef.current = e.clientY;
    draggingIdxRef.current = index;
    pointerDeltaRef.current = 0;
    setDraggingIdx(index);
    setPointerDeltaY(0);
  };

  // Global pointer move & up listeners
  useEffect(() => {
    if (draggingIdx === null) return;

    const handlePointerMove = (e: PointerEvent) => {
      const delta = e.clientY - startYRef.current;
      pointerDeltaRef.current = delta;
      setPointerDeltaY(delta);
    };

    const handlePointerUp = () => {
      const sourceIdx = draggingIdxRef.current;
      const delta = pointerDeltaRef.current;

      if (sourceIdx !== null) {
        const targetOffset = Math.round(delta / ITEM_HEIGHT);
        const targetIdx = Math.max(
          0,
          Math.min(displayedActiveTasks.length - 1, sourceIdx + targetOffset)
        );

        if (sourceIdx !== targetIdx) {
          // Find IDs to reorder in full note.tasks
          const sourceTask = displayedActiveTasks[sourceIdx];
          const targetTask = displayedActiveTasks[targetIdx];

          const realSourceIdx = note.tasks.findIndex((t) => t.id === sourceTask.id);
          const realTargetIdx = note.tasks.findIndex((t) => t.id === targetTask.id);

          if (realSourceIdx >= 0 && realTargetIdx >= 0) {
            const newTasks = [...note.tasks];
            const [removed] = newTasks.splice(realSourceIdx, 1);
            newTasks.splice(realTargetIdx, 0, removed);

            onUpdateNote({
              ...note,
              tasks: newTasks,
              updatedAt: Date.now(),
            });
          }
        }
      }

      setDraggingIdx(null);
      setPointerDeltaY(0);
      draggingIdxRef.current = null;
      pointerDeltaRef.current = 0;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [draggingIdx, displayedActiveTasks, note, onUpdateNote]);

  // Calculate smooth translateY for each item
  const getItemTranslateY = (index: number): number => {
    if (draggingIdx === null) return 0;
    if (index === draggingIdx) return pointerDeltaY;

    const targetOffset = Math.round(pointerDeltaY / ITEM_HEIGHT);
    const targetIdx = Math.max(
      0,
      Math.min(displayedActiveTasks.length - 1, draggingIdx + targetOffset)
    );

    if (draggingIdx < targetIdx && index > draggingIdx && index <= targetIdx) {
      return -ITEM_HEIGHT;
    }
    if (draggingIdx > targetIdx && index < draggingIdx && index >= targetIdx) {
      return ITEM_HEIGHT;
    }
    return 0;
  };

  const isLeaving = isDeleting || isDeletingSelf;

  return (
    <div className={`unboxed-note-workspace-wrapper ${isLeaving ? 'is-deleting-flow-exit' : ''}`}>
      {/* Sticky Top Wave Progress Bar - spans from sidebar end to right edge */}
      <ProgressBar
        completed={completedCount}
        total={totalCount}
        size="prominent"
        lastFlowAt={note.lastFlowAt}
      />

      <div className="unboxed-note-workspace">
        {/* Title Header (32px) */}
        <div className="note-title-bar">
          <div className="title-text-wrap">
            {isEditingTitle ? (
              <input
                type="text"
                className="clean-title-input"
                value={titleText}
                autoFocus
                onChange={(e) => setTitleText(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleBlur();
                  if (e.key === 'Escape') {
                    setTitleText(note.title);
                    setIsEditingTitle(false);
                  }
                }}
              />
            ) : (
              <h1
                className="clean-title-heading"
                onClick={() => setIsEditingTitle(true)}
                title="Click to edit title"
              >
                {note.title || 'Untitled'}
              </h1>
            )}
          </div>
        </div>

      {/* Active Tasks Scrolling Viewport */}
      <div className="active-tasks-container">
        <div className="active-tasks-header">
          <span className="section-label">To Do</span>
          {uncheckedTasks.length > 2 && (
            <button
              type="button"
              className="scroll-toggle-link"
              onClick={() => setShowAllActive(!showAllActive)}
            >
              {showAllActive ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* 2-Item Scrolling Display Window */}
        <div className="scrolling-task-window">
          {uncheckedTasks.length === 0 ? (
            <div className="all-done-placeholder">
              {totalCount > 0 ? (
                <p>✨ All done!</p>
              ) : (
                <p>No items yet. Add new below.</p>
              )}
            </div>
          ) : (
            <div className="animated-tasks-stack">
              {displayedActiveTasks.map((task, idx) => {
                return (
                  <TaskItem
                    key={task.id}
                    task={task}
                    index={idx}
                    isExiting={exitingTaskId === task.id}
                    isDeleting={deletingTaskId === task.id}
                    isDraggable={showAllActive}
                    isDragging={draggingIdx === idx}
                    translateY={getItemTranslateY(idx)}
                    onToggle={handleToggleTask}
                    onUpdateTitle={handleUpdateTaskTitle}
                    onDelete={handleDeleteTask}
                    onPointerDragStart={handlePointerDragStart}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Inline Add Task Input */}
        <form className="clean-add-form" onSubmit={handleAddTask}>
          <div className="add-icon-box">
            <Plus size={15} />
          </div>
          <input
            type="text"
            className="clean-add-input"
            placeholder="Add new (press Enter)..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
          />
          {newTaskText.trim() && (
            <button type="submit" className="clean-add-submit">
              Add
            </button>
          )}
        </form>
      </div>

      {/* Completed Section */}
      {completedTasks.length > 0 && (
        <div className="completed-section">
          {(() => {
            const isAllCompleted = uncheckedTasks.length === 0 && completedTasks.length > 0;
            const isCompletedExpanded = showCompleted || isAllCompleted;
            return (
              <>
                <button
                  type="button"
                  className="completed-toggle-btn"
                  onClick={() => setShowCompleted(!isCompletedExpanded)}
                >
                  {isCompletedExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span>Completed ({completedTasks.length})</span>
                </button>

                {isCompletedExpanded && (
                  <div className="completed-tasks-list">
                    {completedTasks.map((task, idx) => {
                      return (
                        <TaskItem
                          key={task.id}
                          task={task}
                          index={idx}
                          isDeleting={deletingTaskId === task.id}
                          onToggle={handleToggleTask}
                          onUpdateTitle={handleUpdateTaskTitle}
                          onDelete={handleDeleteTask}
                        />
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Screen-Fixed Bottom-Right Delete Button */}
      <button
        type="button"
        className="screen-fixed-delete-btn"
        onClick={handleDeleteNoteClick}
        title="Delete"
        aria-label="Delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>
);
};
