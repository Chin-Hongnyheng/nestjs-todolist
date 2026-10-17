import type { Todo, TodoInput, TodoStatus } from '../types';

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '') + (RAW_BASE_URL.endsWith('/api') ? '' : '/api');

export interface BackendTodo {
  id: number;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  starred?: boolean;
  order?: number;
}

export function toBackendStatus(status: TodoStatus): 'TODO' | 'IN_PROGRESS' | 'DONE' {
  switch (status) {
    case 'in_progress':
      return 'IN_PROGRESS';
    case 'done':
      return 'DONE';
    case 'todo':
    default:
      return 'TODO';
  }
}

export function toFrontendStatus(status: string): TodoStatus {
  switch (status?.toUpperCase()) {
    case 'IN_PROGRESS':
      return 'in_progress';
    case 'DONE':
      return 'done';
    case 'TODO':
    default:
      return 'todo';
  }
}

const META_STORAGE_KEY = 'taskflow_todo_meta_v1';

function getLocalMeta(): Record<string, Partial<Todo>> {
  try {
    const raw = localStorage.getItem(META_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalMeta(id: string, meta: Partial<Todo>) {
  try {
    const current = getLocalMeta();
    current[id] = { ...current[id], ...meta };
    localStorage.setItem(META_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save metadata', e);
  }
}

export function removeLocalMeta(id: string) {
  try {
    const current = getLocalMeta();
    delete current[id];
    localStorage.setItem(META_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to delete metadata', e);
  }
}

export const todoApi = {
  async getAll(params?: { status?: string; q?: string }): Promise<Todo[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all' && params.status !== 'starred') {
      query.append('status', toBackendStatus(params.status as TodoStatus));
    }
    if (params?.q?.trim()) {
      query.append('q', params.q.trim());
    }
    const queryString = query.toString();
    const url = queryString ? `${API_BASE_URL}/todos?${queryString}` : `${API_BASE_URL}/todos`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch todos: ${res.statusText}`);
    }
    const data: BackendTodo[] = await res.json();
    const meta = getLocalMeta();

    return data.map((item) => {
      const idStr = String(item.id);
      const itemMeta = meta[idStr] || {};
      return {
        id: idStr,
        title: item.title,
        status: toFrontendStatus(item.status),
        description: itemMeta.description || '',
        priority: itemMeta.priority || 'medium',
        isStarred: item.starred !== undefined ? item.starred : (itemMeta.isStarred || false),
        category: itemMeta.category || 'Work',
        dueDate: itemMeta.dueDate || '',
        createdAt: itemMeta.createdAt || new Date().toISOString(),
      };
    });
  },

  async create(input: TodoInput): Promise<Todo> {
    const res = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: input.title,
        status: toBackendStatus(input.status),
        starred: input.isStarred ?? false,
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to create todo: ${res.statusText}`);
    }
    const created: BackendTodo = await res.json();
    const idStr = String(created.id);
    const meta: Partial<Todo> = {
      description: input.description || '',
      priority: input.priority || 'medium',
      isStarred: created.starred ?? input.isStarred ?? false,
      category: input.category || 'Work',
      dueDate: input.dueDate || '',
      createdAt: new Date().toISOString(),
    };
    saveLocalMeta(idStr, meta);

    return {
      id: idStr,
      title: created.title,
      status: toFrontendStatus(created.status),
      description: meta.description || '',
      priority: meta.priority || 'medium',
      isStarred: meta.isStarred || false,
      category: meta.category || 'Work',
      dueDate: meta.dueDate || '',
      createdAt: meta.createdAt || new Date().toISOString(),
    };
  },

  async update(
    id: string,
    updates: { title?: string; status?: TodoStatus; starred?: boolean; meta?: Partial<Todo> }
  ): Promise<void> {
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      const payload: { title?: string; status?: string; starred?: boolean } = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.status !== undefined) payload.status = toBackendStatus(updates.status);
      if (updates.starred !== undefined) payload.starred = updates.starred;

      if (Object.keys(payload).length > 0) {
        const res = await fetch(`${API_BASE_URL}/todos/${numericId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          throw new Error(`Failed to update todo: ${res.statusText}`);
        }
      }
    }

    if (updates.meta) {
      saveLocalMeta(id, updates.meta);
    }
  },

  async bulkUpdateStatus(ids: string[], status: TodoStatus): Promise<void> {
    const numericIds = ids.map((id) => parseInt(id, 10)).filter((n) => !isNaN(n));
    if (numericIds.length > 0) {
      const res = await fetch(`${API_BASE_URL}/todos/bulk`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: numericIds,
          status: toBackendStatus(status),
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to bulk update status: ${res.statusText}`);
      }
    }
  },

  async bulkDelete(ids: string[]): Promise<void> {
    const numericIds = ids.map((id) => parseInt(id, 10)).filter((n) => !isNaN(n));
    if (numericIds.length > 0) {
      const res = await fetch(`${API_BASE_URL}/todos/bulk`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: numericIds,
          action: 'delete',
        }),
      });
      if (!res.ok) {
        const delRes = await fetch(`${API_BASE_URL}/todos/bulk`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: numericIds }),
        });
        if (!delRes.ok && delRes.status !== 204) {
          throw new Error(`Failed to bulk delete todos: ${delRes.statusText}`);
        }
      }
    }
    ids.forEach((id) => removeLocalMeta(id));
  },

  async reorder(ids: string[]): Promise<void> {
    const numericIds = ids.map((id) => parseInt(id, 10)).filter((n) => !isNaN(n));
    if (numericIds.length > 0) {
      const res = await fetch(`${API_BASE_URL}/todos/order`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: numericIds }),
      });
      if (!res.ok) {
        throw new Error(`Failed to reorder todos: ${res.statusText}`);
      }
    }
  },

  async delete(id: string): Promise<void> {
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      const res = await fetch(`${API_BASE_URL}/todos/${numericId}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 404) {
        throw new Error(`Failed to delete todo: ${res.statusText}`);
      }
    }
    removeLocalMeta(id);
  },
};
