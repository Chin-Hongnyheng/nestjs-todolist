import React from 'react';
import type { TodoStatus } from '../types';

interface BulkActionBarProps {
  selectedCount: number;
  onBulkStatusChange: (status: TodoStatus) => void;
  onBulkStar: (starred: boolean) => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onBulkStatusChange,
  onBulkStar,
  onBulkDelete,
  onClearSelection
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bulk-action-bar" role="toolbar" aria-label="Bulk actions for selected tasks">
      <span className="bulk-count-badge">
        {selectedCount} {selectedCount === 1 ? 'task' : 'tasks'} selected
      </span>

      <div className="bulk-btn-group">
        {/* Set to Done */}
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          onClick={() => onBulkStatusChange('done')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Done</span>
        </button>

        {/* Set to In Progress */}
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          onClick={() => onBulkStatusChange('in_progress')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
          <span>In Progress</span>
        </button>

        {/* Set to To Do */}
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          onClick={() => onBulkStatusChange('todo')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span>To Do</span>
        </button>

        {/* Star */}
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          onClick={() => onBulkStar(true)}
          title="Star all selected"
        >
          <span style={{ color: '#fbbf24' }}>★</span>
          <span>Star</span>
        </button>

        {/* Bulk Delete */}
        <button
          type="button"
          className="btn"
          style={{
            padding: '6px 12px',
            fontSize: '0.8rem',
            background: 'rgba(244, 63, 94, 0.15)',
            color: '#f43f5e',
            border: '1px solid rgba(244, 63, 94, 0.3)'
          }}
          onClick={onBulkDelete}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          </svg>
          <span>Delete</span>
        </button>

        {/* Cancel Selection */}
        <button
          type="button"
          className="btn-icon"
          style={{ width: '32px', height: '32px' }}
          onClick={onClearSelection}
          title="Clear selection"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};
