/**
 * api-client.ts — React Query hooks wired to the real API.
 *
 * All hooks consume the typed functions from api/habitApi.ts and api/authApi.ts.
 * The mock data is preserved below for offline/dev fallback and used
 * during the isInitialising state only.
 */
import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import * as habitApi from '../api/habitApi';
import { useOfflineStore } from '../store/offlineStore';
import { useHabitStore } from '../store/habitStore';

// ─── Type Definitions ────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  timezone?: string;
  pictureUrl?: string;
  joinedAt?: string;
}

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

// ─── Query Key Factories ─────────────────────────────────────────────────────

export const getListHabitsQueryKey        = ()           => ['habits'];
export const getGetUserProfileQueryKey    = ()           => ['userProfile'];
export const getGetTodayHabitsQueryKey    = ()           => ['todayHabits'];
export const getGetStatsSummaryQueryKey   = ()           => ['statsSummary'];
export const getGetHabitHistoryQueryKey   = (id?: string) => id ? ['habitHistory', id] : ['habitHistory'];
export const getGetWeeklyStatsQueryKey    = ()           => ['weeklyStats'];

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetUserProfile(): UseQueryResult<UserProfile> {
  return useQuery({
    queryKey: getGetUserProfileQueryKey(),
    queryFn: async () => {
      // Profile is derived from the auth store (set during login)
      // A dedicated /users/me endpoint can be added later
      const { useAuthStore } = await import('../store/authStore');
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('Not authenticated');
      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        timezone: user.timezone,
        pictureUrl: user.pictureUrl,
        joinedAt: user.joinedAt,
      };
    },
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data }: { data: { displayName?: string; timezone?: string } }) => {
      // TODO: wire to PUT /api/v1/users/me when endpoint is added
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetUserProfileQueryKey() });
    },
  });
}

// ─── Habits ──────────────────────────────────────────────────────────────────

export function useListHabits(): UseQueryResult<HabitResponse[]> {
  const { setHabits } = useHabitStore();
  return useQuery({
    queryKey: getListHabitsQueryKey(),
    queryFn: async () => {
      const habits = await habitApi.listHabits();
      setHabits(habits);
      return habits;
    },
  });
}

export function useGetStatsSummary(): UseQueryResult<StatsSummary> {
  return useQuery({
    queryKey: getGetStatsSummaryQueryKey(),
    queryFn: async () => {
      const habits = await habitApi.listHabits();
      return habitApi.computeStatsSummary(habits);
    },
  });
}

export function useGetTodayHabits(): UseQueryResult<TodayHabitEntry[]> {
  return useQuery({
    queryKey: getGetTodayHabitsQueryKey(),
    queryFn: async () => {
      const habits = await habitApi.listHabits();
      return habits.map((habit) => ({ habit, isDue: true }));
    },
  });
}

export function useGetHabitHistory(habitId?: string): UseQueryResult<HabitLogEntry[]> {
  return useQuery({
    queryKey: getGetHabitHistoryQueryKey(habitId),
    queryFn: () => habitApi.getHabitHistory(habitId!),
    enabled: !!habitId,
  });
}

export function useGetWeeklyStats(): UseQueryResult<WeeklyStatEntry[]> {
  return useQuery({
    queryKey: getGetWeeklyStatsQueryKey(),
    queryFn: async () => {
      const habits = await habitApi.listHabits();
      // Build the past 7 days from actual completion data
      const today = new Date();
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const isToday = i === 6;
        // For today, use the live completedToday field
        const count = isToday
          ? habits.filter((h) => h.completedToday && !h.archived).length
          : 0; // historical data would require separate /logs endpoint aggregation
        return { date: dateStr, count };
      });
    },
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useLogHabit() {
  const queryClient = useQueryClient();
  const { enqueue } = useOfflineStore();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { date: string; completed: boolean; subHabitId?: string };
    }) => {
      const loggedAt = new Date().toISOString();

      if (!navigator.onLine) {
        // Queue for later sync
        enqueue({
          habitId: id,
          subHabitId: data.subHabitId,
          date: data.date,
          completed: data.completed,
          loggedAt,
        });
        return null;
      }

      return habitApi.logCompletion({
        habitId: id,
        subHabitId: data.subHabitId,
        date: data.date,
        completed: data.completed,
        loggedAt,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListHabitsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetTodayHabitsQueryKey() });
    },
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: {
        name: string;
        description?: string;
        habitType: 'POSITIVE' | 'NEGATIVE' | 'COMPOSITE';
        rrule: string;
        color?: string;
        subHabits?: string[];
      };
    }) => {
      return habitApi.createHabit({
        name: data.name,
        description: data.description,
        habitType: data.habitType,
        rrule: data.rrule,
        subHabits: data.habitType === 'COMPOSITE' ? data.subHabits : [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListHabitsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<HabitResponse> & { subHabits?: string[] };
    }) => {
      return habitApi.updateHabit(id, {
        name: data.name!,
        description: data.description,
        habitType: data.habitType!,
        rrule: data.rrule!,
        subHabits: data.habitType === 'COMPOSITE' ? data.subHabits : [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListHabitsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetTodayHabitsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await habitApi.archiveHabit(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListHabitsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetTodayHabitsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
    },
  });
}
