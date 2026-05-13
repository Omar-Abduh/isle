import { create } from 'zustand';
import type { HabitResponse } from '../types/api';

interface HabitState {
  habits: HabitResponse[];
  setHabits: (habits: HabitResponse[]) => void;
  addHabit: (habit: HabitResponse) => void;
  updateHabit: (id: string, changes: Partial<HabitResponse>) => void;
  removeHabit: (id: string) => void;
  updateStreak: (id: string, currentStreak: number) => void;
}

export const useHabitStore = create<HabitState>()((set) => ({
  habits: [],
  setHabits: (habits) => set({ habits }),
  addHabit: (habit) => set((s) => ({ habits: [habit, ...s.habits] })),
  updateHabit: (id, changes) =>
    set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, ...changes } : h)) })),
  removeHabit: (id) =>
    set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
  updateStreak: (id, currentStreak) =>
    set((s) => ({
      habits: s.habits.map((h) =>
        h.id === id
          ? { ...h, currentStreak, longestStreak: Math.max(h.longestStreak, currentStreak) }
          : h
      ),
    })),
}));
