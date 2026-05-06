import { useQuery, useMutation, UseQueryResult } from '@tanstack/react-query';

// ─── Type Definitions (aligned with Plan.md entities) ─────────────────────

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  timezone?: string;
  joinedAt?: string;
  googleSub?: string;
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

export interface SubHabitResponse {
  id: string;
  name: string;
  sortOrder: number;
  completedToday?: boolean;
}

export interface TodayHabitEntry {
  habit: HabitResponse;
  isDue: boolean;
}

export interface HabitLogEntry {
  id: string;
  habitId: string;
  subHabitId?: string;
  date: string;
  completed: boolean;
  loggedAt: string;
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

// ─── Query Key Factories ──────────────────────────────────────────────────

export function getGetUserProfileQueryKey(): string[] {
  return ['userProfile'];
}

export function getGetTodayHabitsQueryKey(): string[] {
  return ['todayHabits'];
}

export function getGetStatsSummaryQueryKey(): string[] {
  return ['statsSummary'];
}

export function getGetHabitHistoryQueryKey(habitId?: string): string[] {
  return habitId ? ['habitHistory', habitId] : ['habitHistory'];
}

export function getGetWeeklyStatsQueryKey(): string[] {
  return ['weeklyStats'];
}

export function getListHabitsQueryKey(): string[] {
  return ['habits'];
}

// ─── Mock Query Hooks (will be replaced by real API calls) ────────────────

export function useGetUserProfile(): UseQueryResult<UserProfile> {
  return useQuery({
    queryKey: getGetUserProfileQueryKey(),
    queryFn: async () => ({
      id: '1',
      email: 'user@isle.app',
      displayName: 'Demo User',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      joinedAt: '2025-01-15T00:00:00Z',
    }),
  });
}

export function useUpdateUserProfile() {
  return useMutation({
    mutationFn: async ({ data }: { data: { displayName?: string; timezone?: string } }) => data,
  });
}

// --- In-Memory Mock Store ---
let MOCK_HABITS: HabitResponse[] = [
  {
    id: '1',
    name: 'Morning Meditation',
    description: '10 minutes of mindfulness',
    habitType: 'POSITIVE',
    rrule: 'FREQ=DAILY',
    currentStreak: 12,
    longestStreak: 30,
    archived: false,
    color: '#247E84',
    icon: '🧘',
    completedToday: true,
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2025-05-05T08:00:00Z',
  },
  {
    id: '2',
    name: 'Read 30 Minutes',
    description: 'Read at least 30 pages',
    habitType: 'POSITIVE',
    rrule: 'FREQ=DAILY',
    currentStreak: 5,
    longestStreak: 14,
    archived: false,
    color: '#7C3AED',
    icon: '📚',
    completedToday: false,
    createdAt: '2025-03-10T00:00:00Z',
    updatedAt: '2025-05-05T08:00:00Z',
  },
  {
    id: '3',
    name: 'Exercise',
    description: 'At least 30 min workout',
    habitType: 'POSITIVE',
    rrule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
    currentStreak: 3,
    longestStreak: 8,
    archived: false,
    color: '#EA580C',
    icon: '💪',
    completedToday: false,
    createdAt: '2025-04-01T00:00:00Z',
    updatedAt: '2025-05-05T08:00:00Z',
  },
];

export function useListHabits(): UseQueryResult<HabitResponse[]> {
  return useQuery({
    queryKey: getListHabitsQueryKey(),
    queryFn: async () => [...MOCK_HABITS],
  });
}

export function useGetStatsSummary(): UseQueryResult<StatsSummary> {
  return useQuery({
    queryKey: getGetStatsSummaryQueryKey(),
    queryFn: async () => ({
      totalHabits: 3,
      completedToday: 1,
      currentStreak: 12,
      longestStreak: 30,
      activeStreaks: 3,
    }),
  });
}

export function useGetTodayHabits(): UseQueryResult<TodayHabitEntry[]> {
  return useQuery({
    queryKey: getGetTodayHabitsQueryKey(),
    queryFn: async () => {
      return MOCK_HABITS.map(habit => ({
        habit: { ...habit },
        isDue: true, // For mock purposes, assume all are due
      }));
    },
  });
}

export function useGetHabitHistory(habitId?: string): UseQueryResult<HabitLogEntry[]> {
  return useQuery({
    queryKey: getGetHabitHistoryQueryKey(habitId),
    queryFn: async () => [],
    enabled: !!habitId,
  });
}

export function useGetWeeklyStats(): UseQueryResult<WeeklyStatEntry[]> {
  return useQuery({
    queryKey: getGetWeeklyStatsQueryKey(),
    queryFn: async () => [],
  });
}

export function useLogHabit() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { date: string; completed: boolean; subHabitId?: string } }) => {
      const idx = MOCK_HABITS.findIndex(h => h.id === id);
      if (idx !== -1) {
        if (data.subHabitId) {
          const subIdx = MOCK_HABITS[idx].subHabits?.findIndex(s => s.id === data.subHabitId) ?? -1;
          if (subIdx !== -1 && MOCK_HABITS[idx].subHabits) {
            MOCK_HABITS[idx].subHabits![subIdx].completedToday = data.completed;
            const allSubsComplete = MOCK_HABITS[idx].subHabits!.every(s => s.completedToday);
            MOCK_HABITS[idx].completedToday = allSubsComplete;
          }
        } else {
          MOCK_HABITS[idx].completedToday = data.completed;
          if (MOCK_HABITS[idx].subHabits && data.completed) {
            MOCK_HABITS[idx].subHabits!.forEach(s => s.completedToday = true);
          }
        }
      }
      return { id, ...data };
    },
  });
}

export function useCreateHabit() {
  return useMutation({
    mutationFn: async ({ data }: { data: { name: string; description?: string; habitType: 'POSITIVE' | 'NEGATIVE' | 'COMPOSITE'; rrule: string; color?: string; subHabits?: string[] } }) => {
      const newHabit: HabitResponse = {
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description,
        habitType: data.habitType,
        rrule: data.rrule,
        color: data.color,
        subHabits: data.subHabits?.map((name, i) => ({
          id: crypto.randomUUID(),
          name,
          sortOrder: i,
          completedToday: false,
        })),
        currentStreak: 0,
        longestStreak: 0,
        archived: false,
        completedToday: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_HABITS.push(newHabit);
      return newHabit;
    },
  });
}

export function useUpdateHabit() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<HabitResponse> & { subHabits?: string[] } }) => {
      const idx = MOCK_HABITS.findIndex(h => h.id === id);
      if (idx !== -1) {
        MOCK_HABITS[idx] = { ...MOCK_HABITS[idx], ...data } as HabitResponse;
        if (data.subHabits && Array.isArray(data.subHabits) && typeof data.subHabits[0] === 'string') {
          MOCK_HABITS[idx].subHabits = (data.subHabits as unknown as string[]).map((name, i) => ({
            id: crypto.randomUUID(),
            name,
            sortOrder: i,
            completedToday: false,
          }));
        }
      }
      return MOCK_HABITS[idx];
    },
  });
}

export function useDeleteHabit() {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      MOCK_HABITS = MOCK_HABITS.filter(h => h.id !== id);
      return id;
    },
  });
}
