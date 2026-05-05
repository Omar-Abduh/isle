export type HabitType = 'POSITIVE' | 'NEGATIVE' | 'COMPOSITE';

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  description?: string;
  archived: boolean;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  subHabitId?: string;
  logDate: string;
  completed: boolean;
}

export interface SubHabit {
  id: string;
  parentId: string;
  name: string;
}
