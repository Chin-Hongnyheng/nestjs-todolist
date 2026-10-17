import type { Todo, UserProfile } from '../types';

export const initialProfile: UserProfile = {
  name: 'Chin Hong',
  role: 'Software Developer',
  email: 'chinhong@example.com',
  avatar: '👨‍💻'
};

export const initialCategories: string[] = [
  'Work',
  'Design',
  'Frontend',
  'Personal',
  'Urgent'
];

export const initialTodos: Todo[] = [
  {
    id: 'task-1',
    title: 'Design high-converting landing page prototype',
    description: 'Create interactive Figma wireframes and high-fidelity mockups for desktop and mobile.',
    status: 'in_progress',
    priority: 'high',
    isStarred: true,
    category: 'Design',
    dueDate: '2026-10-20',
    createdAt: '2026-10-15T09:00:00.000Z'
  },
  {
    id: 'task-2',
    title: 'Implement Dark & Light mode theme system',
    description: 'Set up CSS custom properties and persistent state in localStorage with smooth transitions.',
    status: 'done',
    priority: 'medium',
    isStarred: true,
    category: 'Frontend',
    dueDate: '2026-10-16',
    createdAt: '2026-10-14T11:30:00.000Z'
  },
  {
    id: 'task-3',
    title: 'Set up Vite + React project scaffolding',
    description: 'Configure TypeScript, ESLint, asset pipelines, and verify package installations.',
    status: 'done',
    priority: 'low',
    isStarred: false,
    category: 'Work',
    dueDate: '2026-10-14',
    createdAt: '2026-10-13T14:15:00.000Z'
  },
  {
    id: 'task-4',
    title: 'Build drag-and-drop reordering for tasks',
    description: 'Add HTML5 drag-and-drop support with visual indicators and reorder callbacks.',
    status: 'in_progress',
    priority: 'high',
    isStarred: false,
    category: 'Frontend',
    dueDate: '2026-10-18',
    createdAt: '2026-10-16T08:00:00.000Z'
  },
  {
    id: 'task-5',
    title: 'Implement batch selection and bulk action toolbar',
    description: 'Allow multi-select checkboxes and bulk status updates, bulk delete, and bulk star.',
    status: 'todo',
    priority: 'medium',
    isStarred: true,
    category: 'Frontend',
    dueDate: '2026-10-22',
    createdAt: '2026-10-16T10:00:00.000Z'
  },
  {
    id: 'task-6',
    title: 'Weekly 1:1 sync with engineering team',
    description: 'Review roadmap milestones, discuss technical debt, and plan sprint deliverables.',
    status: 'todo',
    priority: 'medium',
    isStarred: false,
    category: 'Work',
    dueDate: '2026-10-24',
    createdAt: '2026-10-16T12:00:00.000Z'
  },
  {
    id: 'task-7',
    title: 'Buy groceries & gym supplements',
    description: 'Oat milk, Greek yogurt, fresh fruits, whey protein powder, almonds.',
    status: 'todo',
    priority: 'low',
    isStarred: false,
    category: 'Personal',
    dueDate: '2026-10-17',
    createdAt: '2026-10-16T13:30:00.000Z'
  }
];
