import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface OfflineLogEntry {
  id: string;
  habitId: string;
  subHabitId?: string;
  date: string;       // YYYY-MM-DD
  completed: boolean;
  loggedAt: string;   // ISO 8601
  retries: number;
}

interface OfflineState {
  queue: OfflineLogEntry[];
  enqueue: (entry: Omit<OfflineLogEntry, 'id' | 'retries'>) => void;
  dequeue: (id: string) => void;
  incrementRetry: (id: string) => void;
  clear: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      queue: [],

      enqueue: (entry) =>
        set((s) => ({
          queue: [
            ...s.queue,
            { ...entry, id: crypto.randomUUID(), retries: 0 },
          ],
        })),

      dequeue: (id) =>
        set((s) => ({ queue: s.queue.filter((e) => e.id !== id) })),

      incrementRetry: (id) =>
        set((s) => ({
          queue: s.queue.map((e) =>
            e.id === id ? { ...e, retries: e.retries + 1 } : e
          ),
        })),

      clear: () => set({ queue: [] }),
    }),
    {
      name: 'isle-offline-queue',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
