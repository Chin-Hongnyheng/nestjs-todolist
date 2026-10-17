import React, { useState, useEffect } from 'react';
import type { Todo, TodoInput, TodoPriority, TodoStatus } from '../types';

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (todoData: TodoInput) => void;
  editingTodo?: Todo | null;
  categories: string[];
}

export const TodoModal: React.FC<TodoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTodo,
  categories
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TodoStatus>('todo');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [isStarred, setIsStarred] = useState(false);
  const [category, setCategory] = useState(categories[0] || 'Work');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description || '');
      setStatus(editingTodo.status);
      setPriority(editingTodo.priority);
      setIsStarred(editingTodo.isStarred);
      setCategory(editingTodo.category || categories[0] || 'Work');
      setDueDate(editingTodo.dueDate || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setIsStarred(false);
      setCategory(categories[0] || 'Work');
      setDueDate('');
    }
  }, [editingTodo, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      isStarred,
      category,
      dueDate
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="todo-modal-title"
      >
        <div className="modal-header">
          <h2 id="todo-modal-title">
            {editingTodo ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="todo-modal-input-title">
                Task Title *
              </label>
              <input
                id="todo-modal-input-title"
                type="text"
                className="form-input"
                placeholder="e.g., Implement dark mode toggle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="todo-modal-input-desc">
                Description / Notes
              </label>
              <textarea
                id="todo-modal-input-desc"
                className="form-textarea"
                placeholder="Add additional context, subtasks, or links..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Status & Priority */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="todo-modal-select-status">
                  Status
                </label>
                <select
                  id="todo-modal-select-status"
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TodoStatus)}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="todo-modal-select-priority">
                  Priority
                </label>
                <select
                  id="todo-modal-select-priority"
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TodoPriority)}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>

            {/* Category & Due Date */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="todo-modal-select-category">
                  Category
                </label>
                <select
                  id="todo-modal-select-category"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="todo-modal-input-due">
                  Due Date
                </label>
                <input
                  id="todo-modal-input-due"
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Star Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={isStarred}
                  onChange={(e) => setIsStarred(e.target.checked)}
                />
                <span style={{ color: '#fbbf24', fontSize: '1rem' }}>★</span>
                <span>Mark as Starred / Priority</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
              {editingTodo ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
