import React from 'react';
import type { Todo, TodoStatus } from '../types';

interface TodoItemProps {
  todo: Todo;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onToggleStar: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  isSelected,
  onToggleSelect,
  onToggleStatus,
  onToggleStar,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop
}) => {
  const getNextStatusLabel = (status: TodoStatus) => {
    if (status === 'todo') return 'Click to move to In Progress';
    if (status === 'in_progress') return 'Click to mark as Done';
    return 'Click to mark as To Do';
  };

  const isOverdue =
    todo.dueDate &&
    todo.status !== 'done' &&
    new Date(todo.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

  return (
    <div
      className={`todo-item ${isSelected ? 'selected' : ''} ${todo.status === 'done' ? 'is-done' : ''}`}
      draggable={Boolean(onDragStart)}
      onDragStart={(e) => onDragStart && onDragStart(e, todo.id)}
      onDragOver={(e) => onDragOver && onDragOver(e, todo.id)}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop && onDrop(e, todo.id)}
    >
      {/* Drag Handle */}
      {onDragStart && (
        <div className="drag-handle" title="Drag to reorder task">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
        </div>
      )}

      {/* Multi-Select Checkbox */}
      <div className="todo-checkbox-wrapper">
        <input
          type="checkbox"
          className="custom-checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(todo.id)}
          aria-label={`Select task ${todo.title}`}
        />
      </div>

      {/* Status Progress Button */}
      <button
        type="button"
        className="status-indicator-btn"
        onClick={() => onToggleStatus(todo.id)}
        title={getNextStatusLabel(todo.status)}
        aria-label={`Current status: ${todo.status}. Click to change.`}
      >
        {todo.status === 'done' ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        ) : todo.status === 'in_progress' ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        )}
      </button>

      {/* Main Content */}
      <div className="todo-content">
        <div className="todo-header-row">
          <span className="todo-title">{todo.title}</span>
          {/* Status Badge */}
          <span className={`badge badge-${todo.status}`}>
            {todo.status === 'todo' ? 'To Do' : todo.status === 'in_progress' ? 'In Progress' : 'Done'}
          </span>
          {/* Priority Badge */}
          <span className={`badge badge-priority-${todo.priority}`}>
            {todo.priority.toUpperCase()}
          </span>
        </div>

        {todo.description && (
          <p className="todo-description">{todo.description}</p>
        )}

        <div className="todo-meta-row">
          {todo.category && (
            <span className="badge badge-category">📁 {todo.category}</span>
          )}

          {todo.dueDate && (
            <span className={`badge-due ${isOverdue ? 'overdue' : ''}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {isOverdue ? 'Overdue: ' : 'Due: '}
              {todo.dueDate}
            </span>
          )}
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="todo-actions">
        {/* Star Button */}
        <button
          type="button"
          className={`star-btn ${todo.isStarred ? 'starred' : ''}`}
          onClick={() => onToggleStar(todo.id)}
          title={todo.isStarred ? 'Unstar task' : 'Star / Mark as Priority'}
          aria-label={todo.isStarred ? 'Starred' : 'Unstarred'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={todo.isStarred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>

        {/* Edit Button */}
        <button
          type="button"
          className="item-action-btn"
          onClick={() => onEdit(todo)}
          title="Edit title, details, status or priority"
          aria-label={`Edit ${todo.title}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
        </button>

        {/* Delete Button */}
        <button
          type="button"
          className="item-action-btn delete"
          onClick={() => onDelete(todo.id)}
          title="Delete task"
          aria-label={`Delete ${todo.title}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
};
