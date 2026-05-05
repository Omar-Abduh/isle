import { useQuery, useMutation, UseQueryResult } from '@tanstack/react-query';

// Type definitions
export interface HabitResponse {
  id: string;
  name: string;
  description?: string;
  frequency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLogEntry {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
}

export interface WeeklyStatEntry {
  date: string;
  count: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
}

export interface StatsSummary {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
}

// Mock hooks
export function useGetUserProfile(): UseQueryResult<UserProfile> {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => ({
      id: '1',
      email: 'user@example.com',
      name: 'Demo User',
    }),
    enabled: false,
  });
}

export function useUpdateUserProfile() {
  return useMutation({
    mutationFn: async (data: UserProfile) => data,
  });
}

export function useListHabits(): UseQueryResult<HabitResponse[]> {
  return useQuery({
    queryKey: ['habits'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetStatsSummary(): UseQueryResult<StatsSummary> {
  return useQuery({
    queryKey: ['statsSummary'],
    queryFn: async () => ({
      totalHabits: 0,
      completedToday: 0,
      currentStreak: 0,
    }),
    enabled: false,
  });
}

export function getGetUserProfileQueryKey(): string[] {
  return ['userProfile'];
}

export function useGetHabit(): UseQueryResult<HabitResponse> {
  return useQuery({
    queryKey: ['habit'],
    queryFn: async () => ({
      id: '',
      name: '',
      createdAt: '',
      updatedAt: '',
    }),
    enabled: false,
  });
}

export function useGetHabitHistory(): UseQueryResult<HabitLogEntry[]> {
  return useQuery({
    queryKey: ['habitHistory'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function getGetHabitQueryKey(): string[] {
  return ['habit'];
}

export function getGetHabitHistoryQueryKey(): string[] {
  return ['habitHistory'];
}

export function useGetWeeklyStats(): UseQueryResult<WeeklyStatEntry[]> {
  return useQuery({
    queryKey: ['weeklyStats'],
    queryFn: async () => [],
    enabled: false,
  });
}

// Added missing hooks
export function useGetTodayHabits(): UseQueryResult<HabitResponse[]> {
  return useQuery({
    queryKey: ['todayHabits'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useLogHabit() {
  return useMutation({
    mutationFn: async (data: { habitId: string, date: string, completed: boolean }) => data,
  });
}

export function useCreateHabit() {
  return useMutation({
    mutationFn: async (data: Partial<HabitResponse>) => data as HabitResponse,
  });
}

export function useUpdateHabit() {
  return useMutation({
    mutationFn: async (data: { id: string, data: Partial<HabitResponse> }) => data.data as HabitResponse,
  });
}

export function useDeleteHabit() {
  return useMutation({
    mutationFn: async (id: string) => id,
  });
}

export function getGetTodayHabitsQueryKey(): string[] {
  return ['todayHabits'];
}

export function getGetStatsSummaryQueryKey(): string[] {
  return ['statsSummary'];
}
