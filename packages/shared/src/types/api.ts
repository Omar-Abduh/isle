export interface SubHabitResponse {
  id: string;
  name: string;
  sortOrder: number;
  completedToday?: boolean;
}

export interface HabitResponse {
  id: string;
  name: string;
  description?: string;
  habitType: 'POSITIVE' | 'NEGATIVE' | 'COMPOSITE';
  rrule: string;
  currentStreak: number;
  longestStreak: number;
  archived: boolean;
  color?: string;
  icon?: string;
  completedToday: boolean;
  createdAt: string;
  updatedAt: string;
  subHabits?: SubHabitResponse[];
}

export interface TodayHabitEntry {
  habit: HabitResponse;
  isDue: boolean;
}

export interface HabitLogEntry {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  loggedAt: string;
  subHabitId?: string;
}

export interface WeeklyStatEntry {
  date: string;
  count: number;
}

export interface StatsSummary {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  longestStreak: number;
  activeStreaks: number;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  timezone?: string;
  pictureUrl?: string;
  joinedAt?: string;
}
