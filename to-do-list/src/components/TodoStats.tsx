import React from 'react';
import type { Todo } from '../types';

interface TodoStatsProps {
  todos: Todo[];
}

export const TodoStats: React.FC<TodoStatsProps> = ({ todos }) => {
  const total = todos.length;
  const inProgress = todos.filter((t) => t.status === 'in_progress').length;
  const done = todos.filter((t) => t.status === 'done').length;
  const starred = todos.filter((t) => t.isStarred).length;

  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="stats-grid">
      {/* Total Tasks */}
      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          </svg>
        </div>
        <div className="stat-info">
          <div className="stat-label">Total Tasks</div>
          <div className="stat-value">{total}</div>
        </div>
      </div>

      {/* In Progress */}
      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div className="stat-info">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{inProgress}</div>
        </div>
      </div>

      {/* Completed */}
      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div className="stat-info">
          <div className="stat-label">Completed ({completionRate}%)</div>
          <div className="stat-value">{done}</div>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
      </div>

      {/* Starred */}
      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <div className="stat-info">
          <div className="stat-label">Starred / Priority</div>
          <div className="stat-value">{starred}</div>
        </div>
      </div>
    </div>
  );
};
