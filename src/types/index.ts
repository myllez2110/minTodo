export interface Task {
  id: string;
  title: string;
  description: string;
  deadline?: Date;
  completed: boolean;
  created_at: Date;
  sync_key: string;
  updated_at?: Date;
}

export type Theme = 'dark' | 'light';

export type Filter = 'all' | 'completed' | 'pending';