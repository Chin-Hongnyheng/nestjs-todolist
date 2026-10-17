export type TodoStatus = 'todo' | 'in_progress' | 'done';

export type TodoPriority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  priority: TodoPriority;
  isStarred: boolean;
  category: string;
  dueDate: string;
  createdAt: string;
}

export type TodoInput = {
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  isStarred?: boolean;
  category: string;
  dueDate?: string;
};

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  avatar: string;
}

export type FilterStatus = 'all' | 'todo' | 'in_progress' | 'done' | 'starred';

export type SortOption = 'order' | 'priority' | 'dueDate' | 'title';

export type ViewMode = 'list' | 'board';
