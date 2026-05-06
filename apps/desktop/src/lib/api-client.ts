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
    description: '10 minutes of mindfulness before breakfast',
    habitType: 'POSITIVE',
    rrule: 'FREQ=DAILY',
    currentStreak: 12,
    longestStreak: 30,
    archived: false,
    color: '#247E84',
    icon: '🧘',
    completedToday: true,
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2026-05-05T08:00:00Z',
  },
  {
    id: '2',
    name: 'Read 30 Minutes',
    description: 'Read at least 30 pages of a book',
    habitType: 'POSITIVE',
    rrule: 'FREQ=DAILY',
    currentStreak: 5,
    longestStreak: 21,
    archived: false,
    color: '#7C3AED',
    icon: '📚',
    completedToday: false,
    createdAt: '2025-03-10T00:00:00Z',
    updatedAt: '2026-05-05T08:00:00Z',
  },
  {
    id: '3',
    name: 'Exercise',
    description: 'At least 30 min workout',
    habitType: 'POSITIVE',
    rrule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
    currentStreak: 3,
    longestStreak: 12,
    archived: false,
    color: '#EA580C',
    icon: '💪',
    completedToday: false,
    createdAt: '2025-04-01T00:00:00Z',
    updatedAt: '2026-05-05T08:00:00Z',
  },
  {
    id: '4',
    name: 'Drink Water',
    description: '8 glasses throughout the day',
    habitType: 'POSITIVE',
    rrule: 'FREQ=DAILY',
    currentStreak: 18,
    longestStreak: 45,
    archived: false,
    color: '#0EA5E9',
    icon: '💧',
    completedToday: true,
    createdAt: '2025-01-20T00:00:00Z',
    updatedAt: '2026-05-06T07:00:00Z',
  },
  {
    id: '5',
    name: 'Weekly Review',
    description: 'Review goals and plan the upcoming week',
    habitType: 'POSITIVE',
    rrule: 'FREQ=WEEKLY;BYDAY=SU',
    currentStreak: 7,
    longestStreak: 10,
    archived: false,
    color: '#D946EF',
    icon: '📋',
    completedToday: false,
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2026-05-04T20:00:00Z',
  },
  {
    id: '6',
    name: 'Morning Routine',
    description: 'Complete the full morning checklist',
    habitType: 'COMPOSITE',
    rrule: 'FREQ=DAILY',
    currentStreak: 9,
    longestStreak: 22,
    archived: false,
    color: '#F59E0B',
    icon: '☀️',
    completedToday: false,
    createdAt: '2025-02-15T00:00:00Z',
    updatedAt: '2026-05-06T06:00:00Z',
    subHabits: [
      { id: 's1', name: 'Make bed', sortOrder: 0, completedToday: true },
      { id: 's2', name: 'Stretch 5 min', sortOrder: 1, completedToday: true },
      { id: 's3', name: 'Healthy breakfast', sortOrder: 2, completedToday: false },
    ],
  },
  {
    id: '7',
    name: 'Budget Check',
    description: 'Review monthly expenses and savings',
    habitType: 'POSITIVE',
    rrule: 'FREQ=MONTHLY;BYMONTHDAY=1',
    currentStreak: 4,
    longestStreak: 6,
    archived: false,
    color: '#10B981',
    icon: '💰',
    completedToday: false,
    createdAt: '2025-04-01T00:00:00Z',
    updatedAt: '2026-05-01T10:00:00Z',
  },
  {
    id: '8',
    name: 'No Social Media',
    description: 'Stay off social media until 5 PM',
    habitType: 'NEGATIVE',
    rrule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
    currentStreak: 2,
    longestStreak: 15,
    archived: false,
    color: '#EF4444',
    icon: '📵',
    completedToday: true,
    createdAt: '2025-05-01T00:00:00Z',
    updatedAt: '2026-05-06T17:00:00Z',
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
    queryFn: async () => {
      const total = MOCK_HABITS.length;
      const completedToday = MOCK_HABITS.filter(h => h.completedToday).length;
      const streaks = MOCK_HABITS.map(h => h.currentStreak);
      const longestStreaks = MOCK_HABITS.map(h => h.longestStreak);
      return {
        totalHabits: total,
        completedToday,
        currentStreak: Math.max(0, ...streaks),
        longestStreak: Math.max(0, ...longestStreaks),
        activeStreaks: streaks.filter(s => s > 0).length,
      };
    },
  });
}

export function useGetTodayHabits(): UseQueryResult<TodayHabitEntry[]> {
  return useQuery({
    queryKey: getGetTodayHabitsQueryKey(),
    queryFn: async () => {
      return MOCK_HABITS.map(habit => ({
        habit: { ...habit },
        isDue: true,
      }));
    },
  });
}

// Seeded random for consistent weekly stats between renders
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function useGetHabitHistory(habitId?: string): UseQueryResult<HabitLogEntry[]> {
  return useQuery({
    queryKey: getGetHabitHistoryQueryKey(habitId),
    queryFn: async () => {
      if (!habitId) return [];
      // Generate 30 days of mock history
      const today = new Date();
      const entries: HabitLogEntry[] = [];
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const seed = parseInt(habitId, 10) * 1000 + i;
        const completed = i === 0
          ? (MOCK_HABITS.find(h => h.id === habitId)?.completedToday ?? false)
          : seededRandom(seed) > 0.35;
        entries.push({
          id: `log-${habitId}-${i}`,
          habitId,
          date: dateStr,
          completed,
          loggedAt: d.toISOString(),
        });
      }
      return entries;
    },
    enabled: !!habitId,
  });
}

export function useGetWeeklyStats(): UseQueryResult<WeeklyStatEntry[]> {
  return useQuery({
    queryKey: getGetWeeklyStatsQueryKey(),
    queryFn: async () => {
      const total = MOCK_HABITS.length;
      const today = new Date();
      // Seeded values for consistent display
      const seededCounts = [4, 6, 3, 7, 5, 6];
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        const isToday = i === 6;
        return {
          date: d.toISOString().split('T')[0],
          count: isToday
            ? MOCK_HABITS.filter(h => h.completedToday).length
            : Math.min(total, seededCounts[i] ?? Math.floor(seededRandom(i * 42) * total)),
        };
      });
    },
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
