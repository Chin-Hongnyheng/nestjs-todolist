import React, { useState } from 'react';
import type { TodoInput, TodoPriority, TodoStatus } from '../types';

interface QuickAddProps {
  onAddTodo: (data: TodoInput) => void;
  categories: string[];
}

export const QuickAdd: React.FC<QuickAddProps> = ({ onAddTodo, categories }) => {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<TodoStatus>('todo');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [category, setCategory] = useState<string>(categories[0] || 'Work');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTodo({
      title: title.trim(),
      status,
      priority,
      category
    });

    setTitle('');
  };

  return (
    <form className="quick-add-container" onSubmit={handleSubmit}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>

      <input
        type="text"
        className="quick-add-input"
        placeholder="Quick add a new task... (press Enter to save)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        id="quick-add-task-input"
      />

      <select
        className="quick-add-select"
        value={status}
        onChange={(e) => setStatus(e.target.value as TodoStatus)}
        aria-label="Initial task status"
      >
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <select
        className="quick-add-select"
        value={priority}
        onChange={(e) => setPriority(e.target.value as TodoPriority)}
        aria-label="Initial task priority"
      >
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
      </select>

      <select
        className="quick-add-select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        aria-label="Task Category"
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
        Add
      </button>
    </form>
  );
};
