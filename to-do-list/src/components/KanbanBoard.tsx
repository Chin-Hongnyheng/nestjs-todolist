import React, { useState } from 'react';
import type { Todo, TodoStatus } from '../types';

interface KanbanBoardProps {
  todos: Todo[];
  onUpdateStatus: (id: string, status: TodoStatus) => void;
  onToggleStar: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  todos,
  onUpdateStatus,
  onToggleStar,
  onEdit,
  onDelete
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TodoStatus | null>(null);

  const columns: { status: TodoStatus; title: string; color: string }[] = [
    { status: 'todo', title: 'To Do', color: '#94a3b8' },
    { status: 'in_progress', title: 'In Progress', color: '#f59e0b' },
    { status: 'done', title: 'Done', color: '#10b981' }
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, columnStatus: TodoStatus) => {
    e.preventDefault();
    if (dragOverColumn !== columnStatus) {
      setDragOverColumn(columnStatus);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TodoStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedId;
    if (id) {
      onUpdateStatus(id, targetStatus);
    }
    setDraggedId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="kanban-grid">
      {columns.map(({ status, title, color }) => {
        const columnTodos = todos.filter((t) => t.status === status);

        return (
          <div
            key={status}
            className={`kanban-column ${dragOverColumn === status ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="kanban-column-header">
              <div className="kanban-column-title">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span>{title}</span>
              </div>
              <span className="kanban-tasks-count">{columnTodos.length}</span>
            </div>

            <div className="kanban-cards-wrapper">
              {columnTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="kanban-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, todo.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {todo.title}
                    </span>
                    <button
                      type="button"
                      className={`star-btn ${todo.isStarred ? 'starred' : ''}`}
                      onClick={() => onToggleStar(todo.id)}
                      title={todo.isStarred ? 'Unstar' : 'Star'}
                      style={{ padding: '2px' }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill={todo.isStarred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  </div>

                  {todo.description && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {todo.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span className={`badge badge-priority-${todo.priority}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        {todo.priority}
                      </span>
                      {todo.category && (
                        <span className="badge badge-category" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          {todo.category}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <button
                        type="button"
                        className="item-action-btn"
                        onClick={() => onEdit(todo)}
                        title="Edit task"
                        style={{ padding: '4px' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="item-action-btn delete"
                        onClick={() => onDelete(todo.id)}
                        title="Delete task"
                        style={{ padding: '4px' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {columnTodos.length === 0 && (
                <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
