import React from 'react';
import type { FilterStatus, ViewMode } from '../types';

interface TodoFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: FilterStatus;
  onStatusFilterChange: (status: FilterStatus) => void;
  counts: {
    all: number;
    todo: number;
    in_progress: number;
    done: number;
    starred: number;
  };
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  totalFilteredCount: number;
}

export const TodoFilters: React.FC<TodoFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  counts,
  categories,
  selectedCategory,
  onCategoryChange,
  viewMode,
  onViewModeChange,
  isAllSelected,
  onToggleSelectAll,
  totalFilteredCount
}) => {
  return (
    <div className="controls-bar">
      {/* Top search & view toggle row */}
      <div className="search-and-views">
        {/* Search Input */}
        <div className="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks by title or details... (press '/' to focus)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            id="search-todos-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* View mode toggle (List vs Board) & Select All */}
        <div className="view-controls">
          {viewMode === 'list' && totalFilteredCount > 0 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                className="custom-checkbox"
                checked={isAllSelected}
                onChange={onToggleSelectAll}
                id="select-all-checkbox"
              />
              <span>Select All</span>
            </label>
          )}

          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => onViewModeChange('list')}
              title="List View"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span>List</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'board' ? 'active' : ''}`}
              onClick={() => onViewModeChange('board')}
              title="Kanban Board View"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="5" height="18" rx="1" />
                <rect x="10" y="3" width="5" height="12" rx="1" />
                <rect x="17" y="3" width="5" height="15" rx="1" />
              </svg>
              <span>Board</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="filter-tabs">
        <button
          type="button"
          className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => onStatusFilterChange('all')}
        >
          <span>All Tasks</span>
          <span className="filter-badge">{counts.all}</span>
        </button>

        <button
          type="button"
          className={`filter-tab ${statusFilter === 'todo' ? 'active' : ''}`}
          onClick={() => onStatusFilterChange('todo')}
        >
          <span>To Do</span>
          <span className="filter-badge">{counts.todo}</span>
        </button>

        <button
          type="button"
          className={`filter-tab ${statusFilter === 'in_progress' ? 'active' : ''}`}
          onClick={() => onStatusFilterChange('in_progress')}
        >
          <span>In Progress</span>
          <span className="filter-badge">{counts.in_progress}</span>
        </button>

        <button
          type="button"
          className={`filter-tab ${statusFilter === 'done' ? 'active' : ''}`}
          onClick={() => onStatusFilterChange('done')}
        >
          <span>Done</span>
          <span className="filter-badge">{counts.done}</span>
        </button>

        <button
          type="button"
          className={`filter-tab ${statusFilter === 'starred' ? 'active' : ''}`}
          onClick={() => onStatusFilterChange('starred')}
        >
          <span style={{ color: '#fbbf24' }}>★</span>
          <span>Starred</span>
          <span className="filter-badge">{counts.starred}</span>
        </button>
      </div>

      {/* Category filter pills */}
      <div className="category-chips">
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category:</span>
        <button
          type="button"
          className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => onCategoryChange('all')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};
