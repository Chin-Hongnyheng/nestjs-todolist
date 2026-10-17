import React, { useState } from 'react';
import type { Todo, UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  todos: Todo[];
  onResetSampleData: () => void;
  onClearAllTodos: () => void;
}

const AVATAR_OPTIONS = ['👨‍💻', '👩‍💻', '🚀', '⚡', '🎨', '🧠', '🎯', '🌟', '💼', '☕'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  todos,
  onResetSampleData,
  onClearAllTodos
}) => {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const total = todos.length;
  const done = todos.filter((t) => t.status === 'done').length;
  const inProgress = todos.filter((t) => t.status === 'in_progress').length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onUpdateUser({
      name: name.trim(),
      role: role.trim() || 'Productivity Master',
      email: email.trim() || 'user@example.com',
      avatar
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="profile-modal-title"
      >
        <div className="modal-header">
          <h2 id="profile-modal-title">Account & Profile Settings</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close profile modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* User Avatar Picker */}
            <div className="form-group">
              <label className="form-label">Avatar Emoji</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '6px 0' }}>
                {AVATAR_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAvatar(opt)}
                    style={{
                      fontSize: '1.4rem',
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      border: avatar === opt ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      background: avatar === opt ? 'var(--primary-light)' : 'var(--bg-input)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 150ms ease'
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Username display & edit */}
            <div className="form-group">
              <label className="form-label" htmlFor="profile-input-name">
                Display Username *
              </label>
              <input
                id="profile-input-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
              />
            </div>

            {/* Role & Email */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="profile-input-role">
                  Role / Title
                </label>
                <input
                  id="profile-input-role"
                  type="text"
                  className="form-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Software Engineer"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-input-email">
                  Email Address
                </label>
                <input
                  id="profile-input-email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Productivity Stats Summary inside Profile */}
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              marginTop: '4px'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Productivity Performance
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{total}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tasks</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>{inProgress}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Active</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>{done}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Done ({completionRate}%)</div>
                </div>
              </div>
            </div>

            {/* Quick Actions / Reset */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, fontSize: '0.78rem', padding: '6px 10px' }}
                onClick={onResetSampleData}
              >
                Reset Sample Tasks
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  flex: 1,
                  fontSize: '0.78rem',
                  padding: '6px 10px',
                  background: 'rgba(244, 63, 94, 0.1)',
                  color: '#f43f5e',
                  border: '1px solid rgba(244, 63, 94, 0.25)'
                }}
                onClick={onClearAllTodos}
              >
                Clear All Tasks
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              {isSaved ? 'Saved! ✓' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
