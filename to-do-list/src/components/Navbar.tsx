import React from 'react';
import type { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile;
  onOpenProfile: () => void;
  onOpenNewTodo: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  apiStatus?: 'connected' | 'connecting' | 'offline';
  onRefresh?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenProfile,
  onOpenNewTodo,
  theme,
  onToggleTheme,
  apiStatus = 'connected',
  onRefresh
}) => {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <div className="brand-info">
          <h1>TaskFlow</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="brand-tag">Workspace • Local Studio</span>
            <button
              type="button"
              onClick={onRefresh}
              title={`API Backend: ${apiStatus === 'connected' ? 'Connected (http://localhost:3000)' : apiStatus} (Click to re-sync)`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid transparent',
                background:
                  apiStatus === 'connected'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : apiStatus === 'connecting'
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                color:
                  apiStatus === 'connected'
                    ? '#10b981'
                    : apiStatus === 'connecting'
                    ? '#f59e0b'
                    : '#ef4444',
                transition: 'all 0.2s ease',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background:
                    apiStatus === 'connected'
                      ? '#10b981'
                      : apiStatus === 'connecting'
                      ? '#f59e0b'
                      : '#ef4444',
                }}
              />
              {apiStatus === 'connected'
                ? 'Backend API Live'
                : apiStatus === 'connecting'
                ? 'Syncing...'
                : 'Offline'}
            </button>
          </div>
        </div>
      </div>

      <div className="header-actions">
        {/* Theme Toggle Button */}
        <button
          type="button"
          className="btn-icon"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Profile Chip (User account section requirement) */}
        <button
          type="button"
          className="profile-chip"
          onClick={onOpenProfile}
          title="Click to view and edit profile"
          aria-label="User Profile"
        >
          <div className="profile-avatar-badge">
            <span>{user.avatar}</span>
            <span className="online-dot" />
          </div>
          <div className="profile-text-group">
            <span className="profile-user-name">{user.name}</span>
            <span className="profile-user-role">{user.role}</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>

        {/* New Task Button */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenNewTodo}
          id="new-task-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};
