import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Theme, Filter } from '../types';
import { supabase } from '../lib/supabase';

interface TodoStore {
  tasks: Task[];
  theme: Theme;
  filter: Filter;
  searchQuery: string;
  syncKey: string;
  setSyncKey: (key: string) => void;
  addTask: (task: Omit<Task, 'id' | 'created_at'>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reorderTasks: (startIndex: number, endIndex: number) => void;
  setTheme: (theme: Theme) => void;
  setFilter: (filter: Filter) => void;
  setSearchQuery: (query: string) => void;
  syncTasks: () => Promise<void>;
}

export const useStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      theme: 'dark',
      filter: 'all',
      searchQuery: '',
      syncKey: '',

      setSyncKey: (key: string) => {
        set({ syncKey: key });
        get().syncTasks();
      },

      syncTasks: async () => {
        const { syncKey } = get();
        if (!syncKey) return;

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('sync_key', syncKey)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error syncing tasks:', error);
          return;
        }

        set({ tasks: data as Task[] });
      },

      addTask: async (task) => {
        const { syncKey } = get();
        if (!syncKey) return;

        const newTask = {
          ...task,
          id: crypto.randomUUID(),
          created_at: new Date(),
          sync_key: syncKey,
        };

        const { error } = await supabase
          .from('tasks')
          .insert([newTask]);

        if (error) {
          console.error('Error adding task:', error);
          return;
        }

        await get().syncTasks();
      },

      toggleTask: async (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        const { error } = await supabase
          .from('tasks')
          .update({ completed: !task.completed })
          .eq('id', id);

        if (error) {
          console.error('Error toggling task:', error);
          return;
        }

        await get().syncTasks();
      },

      updateTask: async (id, updates) => {
        const { error } = await supabase
          .from('tasks')
          .update(updates)
          .eq('id', id);

        if (error) {
          console.error('Error updating task:', error);
          return;
        }

        await get().syncTasks();
      },

      deleteTask: async (id) => {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting task:', error);
          return;
        }

        await get().syncTasks();
      },

      reorderTasks: (startIndex, endIndex) => {
        set((state) => {
          const newTasks = [...state.tasks];
          const [removed] = newTasks.splice(startIndex, 1);
          newTasks.splice(endIndex, 0, removed);
          return { tasks: newTasks };
        });
      },

      setTheme: (theme) => set({ theme }),
      setFilter: (filter) => set({ filter }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'todo-storage',
    }
  )
);