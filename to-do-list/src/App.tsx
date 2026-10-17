import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  Todo,
  TodoInput,
  TodoStatus,
  UserProfile,
  FilterStatus,
  ViewMode
} from './types';
import { initialTodos, initialProfile, initialCategories } from './data/initialData';
import { Navbar } from './components/Navbar';
import { TodoStats } from './components/TodoStats';
import { QuickAdd } from './components/QuickAdd';
import { TodoFilters } from './components/TodoFilters';
import { TodoItem } from './components/TodoItem';
import { KanbanBoard } from './components/KanbanBoard';
import { BulkActionBar } from './components/BulkActionBar';
import { TodoModal } from './components/TodoModal';
import { ProfileModal } from './components/ProfileModal';
import { todoApi, saveLocalMeta } from './services/todoApi';

const LOCAL_STORAGE_KEY_TODOS = 'taskflow_todos_v1';
const LOCAL_STORAGE_KEY_USER = 'taskflow_user_v1';
const LOCAL_STORAGE_KEY_THEME = 'taskflow_theme_v1';

export default function App() {
  // State: Todos
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TODOS);
      return saved ? JSON.parse(saved) : initialTodos;
    } catch {
      return initialTodos;
    }
  });

  // State: API connectivity
  const [apiStatus, setApiStatus] = useState<'connected' | 'connecting' | 'offline'>('connecting');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // State: User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : initialProfile;
    } catch {
      return initialProfile;
    }
  });

  // State: Theme
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Categories list
  const [categories] = useState<string[]>(initialCategories);

  // Filters and views
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Drag and drop in list
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  // Modals state
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Fetch todos from Backend API on mount
  const syncWithBackend = useCallback(async () => {
    setApiStatus('connecting');
    setIsLoading(true);
    setApiError(null);
    try {
      const remoteTodos = await todoApi.getAll();
      setTodos(remoteTodos);
      setApiStatus('connected');
    } catch (err: unknown) {
      console.warn('Backend API unavailable, keeping local data:', err);
      setApiStatus('offline');
      setApiError(err instanceof Error ? err.message : 'Cannot connect to backend');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  // Sync to LocalStorage as cache/fallback
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_TODOS, JSON.stringify(todos));
    } catch (err) {
      console.error('Error saving todos to localStorage', err);
    }
  }, [todos]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(user));
    } catch (err) {
      console.error('Error saving user profile to localStorage', err);
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, theme);
    } catch (err) {
      console.error('Error saving theme', err);
    }
  }, [theme]);

  // Global keyboard shortcuts: "/" to search, "Escape" to clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.getElementById('search-todos-input');
        searchInput?.focus();
      } else if (e.key === 'Escape') {
        if (selectedIds.size > 0) {
          setSelectedIds(new Set());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Status counters for filter tabs
  const counts = useMemo(() => {
    return {
      all: todos.length,
      todo: todos.filter((t) => t.status === 'todo').length,
      in_progress: todos.filter((t) => t.status === 'in_progress').length,
      done: todos.filter((t) => t.status === 'done').length,
      starred: todos.filter((t) => t.isStarred).length
    };
  }, [todos]);

  // Filtered todos based on search, status tab, and category
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      if (statusFilter === 'todo' && todo.status !== 'todo') return false;
      if (statusFilter === 'in_progress' && todo.status !== 'in_progress') return false;
      if (statusFilter === 'done' && todo.status !== 'done') return false;
      if (statusFilter === 'starred' && !todo.isStarred) return false;

      if (selectedCategory !== 'all' && todo.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = todo.title.toLowerCase().includes(query);
        const matchesDesc = (todo.description || '').toLowerCase().includes(query);
        const matchesCat = (todo.category || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [todos, statusFilter, selectedCategory, searchQuery]);

  // CRUD: Create Todo (Syncs to Backend API)
  const handleAddTodo = async (todoData: TodoInput) => {
    try {
      const created = await todoApi.create(todoData);
      setTodos((prev) => [created, ...prev]);
      setApiStatus('connected');
    } catch (err) {
      console.warn('API error, adding locally:', err);
      const fallbackTodo: Todo = {
        title: todoData.title,
        description: todoData.description || '',
        status: todoData.status,
        priority: todoData.priority,
        isStarred: todoData.isStarred || false,
        category: todoData.category || 'Work',
        dueDate: todoData.dueDate || '',
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: new Date().toISOString()
      };
      setTodos((prev) => [fallbackTodo, ...prev]);
      setApiStatus('offline');
    }
  };

  // CRUD: Edit / Update Todo (Syncs to Backend API)
  const handleSaveTodoModal = async (todoData: TodoInput) => {
    if (editingTodo) {
      const updated: Todo = {
        ...editingTodo,
        ...todoData,
        description: todoData.description || '',
        isStarred: todoData.isStarred || false,
        dueDate: todoData.dueDate || ''
      };

      setTodos((prev) => prev.map((t) => (t.id === editingTodo.id ? updated : t)));
      setEditingTodo(null);

      try {
        await todoApi.update(editingTodo.id, {
          title: updated.title,
          status: updated.status,
          meta: {
            description: updated.description,
            priority: updated.priority,
            isStarred: updated.isStarred,
            category: updated.category,
            dueDate: updated.dueDate
          }
        });
        setApiStatus('connected');
      } catch (err) {
        console.warn('API error on update:', err);
        setApiStatus('offline');
      }
    } else {
      await handleAddTodo(todoData);
    }
  };

  // CRUD: Quick toggle status (todo -> in_progress -> done -> todo)
  const handleToggleStatus = async (id: string) => {
    const target = todos.find((t) => t.id === id);
    if (!target) return;

    const nextStatus: TodoStatus =
      target.status === 'todo'
        ? 'in_progress'
        : target.status === 'in_progress'
        ? 'done'
        : 'todo';

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );

    try {
      await todoApi.update(id, { status: nextStatus });
      setApiStatus('connected');
    } catch (err) {
      console.warn('API error on status toggle:', err);
      setApiStatus('offline');
    }
  };

  // Explicit status set (used in Kanban board drag-drop)
  const handleSetStatus = async (id: string, newStatus: TodoStatus) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );

    try {
      await todoApi.update(id, { status: newStatus });
      setApiStatus('connected');
    } catch (err) {
      console.warn('API error on kanban status change:', err);
      setApiStatus('offline');
    }
  };

  // Toggle Star / Priority
  const handleToggleStar = async (id: string) => {
    const target = todos.find((t) => t.id === id);
    if (!target) return;
    const newStarred = !target.isStarred;
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isStarred: newStarred } : t))
    );
    saveLocalMeta(id, { isStarred: newStarred });

    try {
      await todoApi.update(id, { starred: newStarred });
      setApiStatus('connected');
    } catch (err) {
      console.warn('API error on toggle star:', err);
      setApiStatus('offline');
    }
  };

  // CRUD: Delete single Todo
  const handleDeleteTodo = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    try {
      await todoApi.delete(id);
      setApiStatus('connected');
    } catch (err) {
      console.warn('API error on delete:', err);
      setApiStatus('offline');
    }
  };

  // Edit action trigger
  const handleStartEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setIsTodoModalOpen(true);
  };

  // Multi-Select Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllSelected =
    filteredTodos.length > 0 &&
    filteredTodos.every((t) => selectedIds.has(t.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set<string>();
      filteredTodos.forEach((t) => next.add(t.id));
      setSelectedIds(next);
    }
  };

  // Bulk Actions
  const handleBulkStatusChange = async (status: TodoStatus) => {
    const ids = Array.from(selectedIds);
    setTodos((prev) =>
      prev.map((t) => (selectedIds.has(t.id) ? { ...t, status } : t))
    );
    setSelectedIds(new Set());

    try {
      await todoApi.bulkUpdateStatus(ids, status);
      setApiStatus('connected');
    } catch (err) {
      console.warn('API error on bulk status change:', err);
      await Promise.allSettled(ids.map((id) => todoApi.update(id, { status })));
    }
  };

  const handleBulkStar = (starred: boolean) => {
    const ids = Array.from(selectedIds);
    setTodos((prev) =>
      prev.map((t) => (selectedIds.has(t.id) ? { ...t, isStarred: starred } : t))
    );
    ids.forEach((id) => saveLocalMeta(id, { isStarred: starred }));
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    setTodos((prev) => prev.filter((t) => !selectedIds.has(t.id)));
    setSelectedIds(new Set());

    try {
      await todoApi.bulkDelete(ids);
      setApiStatus('connected');
    } catch (err) {
      console.warn('API error on bulk delete:', err);
      await Promise.allSettled(ids.map((id) => todoApi.delete(id)));
    }
  };

  // Drag and Drop reordering in List View
  const handleListDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedItemId(id);
  };

  const handleListDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleListDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (!sourceId || sourceId === targetId) return;

    let updatedList: Todo[] = [];
    setTodos((prev) => {
      const sourceIndex = prev.findIndex((t) => t.id === sourceId);
      const targetIndex = prev.findIndex((t) => t.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const updated = [...prev];
      const [movedItem] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, movedItem);
      updatedList = updated;
      return updated;
    });

    setDraggedItemId(null);

    if (updatedList.length > 0) {
      try {
        await todoApi.reorder(updatedList.map((t) => t.id));
        setApiStatus('connected');
      } catch (err) {
        console.warn('API error on reorder:', err);
      }
    }
  };

  // Reset sample data
  const handleResetSampleData = () => {
    setTodos(initialTodos);
    setSelectedIds(new Set());
    setIsProfileModalOpen(false);
  };

  // Clear all
  const handleClearAllTodos = async () => {
    const currentIds = todos.map((t) => t.id);
    setTodos([]);
    setSelectedIds(new Set());
    setIsProfileModalOpen(false);

    await Promise.allSettled(currentIds.map((id) => todoApi.delete(id)));
  };

  return (
    <>
      <div className="ambient-glow" aria-hidden="true" />

      <main className="app-container">
        {/* Top Navbar with Profile, Theme & Live Backend Indicator */}
        <Navbar
          user={user}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenNewTodo={() => {
            setEditingTodo(null);
            setIsTodoModalOpen(true);
          }}
          theme={theme}
          onToggleTheme={toggleTheme}
          apiStatus={apiStatus}
          onRefresh={syncWithBackend}
        />

        {/* Offline notice if backend unreachable */}
        {apiStatus === 'offline' && (
          <div
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <span>
              ⚠️ Could not connect to NestJS backend at <code>/api/todos</code>{apiError ? ` (${apiError})` : ''}. Operating in offline mode.
            </span>
            <button
              type="button"
              onClick={() => syncWithBackend()}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '12px'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Real-time Productivity & Task Statistics */}
        <TodoStats todos={todos} />

        {/* Quick Add Bar */}
        <QuickAdd onAddTodo={handleAddTodo} categories={categories} />

        {/* Search, Filter Tabs, Categories & View Mode Switcher */}
        <TodoFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          counts={counts}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isAllSelected={isAllSelected}
          onToggleSelectAll={handleToggleSelectAll}
          totalFilteredCount={filteredTodos.length}
        />

        {/* Content Area: List View or Kanban Board View */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', opacity: 0.7 }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔄</div>
            <div>Syncing with backend API...</div>
          </div>
        ) : viewMode === 'board' ? (
          <KanbanBoard
            todos={filteredTodos}
            onUpdateStatus={handleSetStatus}
            onToggleStar={handleToggleStar}
            onEdit={handleStartEdit}
            onDelete={handleDeleteTodo}
          />
        ) : (
          <div className="todo-list-wrapper">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                isSelected={selectedIds.has(todo.id)}
                onToggleSelect={handleToggleSelect}
                onToggleStatus={handleToggleStatus}
                onToggleStar={handleToggleStar}
                onEdit={handleStartEdit}
                onDelete={handleDeleteTodo}
                onDragStart={handleListDragStart}
                onDragOver={handleListDragOver}
                onDrop={handleListDrop}
              />
            ))}

            {filteredTodos.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3>No tasks found</h3>
                <p>
                  {searchQuery || statusFilter !== 'all' || selectedCategory !== 'all'
                    ? 'No tasks matched your current search filters. Try clearing the filter.'
                    : 'You have no tasks on your list yet. Add one above to get started!'}
                </p>
                {(searchQuery || statusFilter !== 'all' || selectedCategory !== 'all') && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Floating Bulk Action Bar (when tasks are selected) */}
        <BulkActionBar
          selectedCount={selectedIds.size}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkStar={handleBulkStar}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedIds(new Set())}
        />

        {/* Create / Edit Todo Modal */}
        <TodoModal
          isOpen={isTodoModalOpen}
          onClose={() => {
            setIsTodoModalOpen(false);
            setEditingTodo(null);
          }}
          onSave={handleSaveTodoModal}
          editingTodo={editingTodo}
          categories={categories}
        />

        {/* User Account / Profile Modal */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
          onUpdateUser={setUser}
          todos={todos}
          onResetSampleData={handleResetSampleData}
          onClearAllTodos={handleClearAllTodos}
        />
      </main>
    </>
  );
}
