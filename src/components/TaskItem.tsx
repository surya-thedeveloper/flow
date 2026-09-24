import React, { useState, useRef, useEffect } from 'react';
import type { Task } from '../types';
import { Check, Trash2, GripVertical } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  index: number;
  isExiting?: boolean;
  isDeleting?: boolean;
  isDraggable?: boolean;
  isDragging?: boolean;
  translateY?: number;
  onToggle: (id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onPointerDragStart?: (e: React.PointerEvent<HTMLDivElement>, index: number) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  index,
  isExiting = false,
  isDeleting = false,
  isDraggable = false,
  isDragging = false,
  translateY = 0,
  onToggle,
  onUpdateTitle,
  onDelete,
  onPointerDragStart,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditText(task.title);
  }, [task.title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdateTitle(task.id, trimmed);
    } else {
      setEditText(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(task.title);
      setIsEditing(false);
    }
  };

  const style: React.CSSProperties = {
    transform: translateY !== 0 || isDragging ? `translate3d(0, ${translateY}px, 0)` : undefined,
    zIndex: isDragging ? 50 : 1,
    transition: isDragging ? 'none' : 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  };

  return (
    <div
      className={`clean-task-row ${task.completed ? 'completed' : ''} ${
        isExiting ? 'sliding-up-exit' : isDeleting ? 'task-deleting-flow-exit' : 'slide-in'
      } ${isDraggable ? 'is-draggable' : ''} ${isDragging ? 'is-active-pointer-drag' : ''}`}
      style={style}
    >
      {/* Drag Grip Handle */}
      {isDraggable && (
        <div
          className="task-drag-handle"
          onPointerDown={(e) => onPointerDragStart && onPointerDragStart(e, index)}
          title="Drag to reorder"
        >
          <GripVertical size={16} />
        </div>
      )}

      {/* Neon Checkbox */}
      <button
        type="button"
        className={`clean-checkbox ${task.completed || isExiting ? 'checked' : ''}`}
        onClick={() => onToggle(task.id)}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        <span className="checkbox-ring">
          <Check className="checkbox-svg" size={13} strokeWidth={3} />
        </span>
      </button>

      {/* Task Text / Inline Input */}
      <div className="task-text-container">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="task-clean-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span
            className="task-display-text"
            onClick={() => setIsEditing(true)}
            title="Click to edit"
          >
            {task.title}
          </span>
        )}
      </div>

      {/* Action Controls */}
      <div className="task-hover-actions">
        <button
          type="button"
          className="clean-icon-btn delete-action"
          onClick={() => onDelete(task.id)}
          title="Delete"
          aria-label="Delete item"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
