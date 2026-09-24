export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  tasks: Task[];
  createdAt: number;
  updatedAt: number;
  lastFlowAt?: number;
}

export type Theme = 'light' | 'dark';
