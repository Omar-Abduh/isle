/**
 * habitApi.ts — All habit + log endpoints, wired to the real API.
 * Each function returns the typed payload extracted from PageResponse<T>.
 */
import { apiFetch } from './client';
import type {
  HabitResponse,
  HabitLogEntry,
  StatsSummary,
} from '@isle/shared';

type PageResponse<T> = { success: boolean; data: T[]; total: number; hasMore: boolean };

// ── Habits ──────────────────────────────────────────────────────────────────

export async function listHabits(page = 0, size = 50): Promise<HabitResponse[]> {
  const json = await apiFetch<PageResponse<HabitResponse>>(
    `/api/v1/habits?page=${page}&size=${size}`,
  );
  return json.data;
}

export interface HabitRequest {
  name: string;
  description?: string;
  habitType: 'POSITIVE' | 'NEGATIVE' | 'COMPOSITE';
  rrule: string;
  subHabits?: string[];
}

export async function createHabit(req: HabitRequest): Promise<HabitResponse> {
  const json = await apiFetch<PageResponse<HabitResponse>>('/api/v1/habits', {
    method: 'POST',
    body: JSON.stringify(req),
  });
  return json.data[0];
}

export async function updateHabit(id: string, req: HabitRequest): Promise<HabitResponse> {
  const json = await apiFetch<PageResponse<HabitResponse>>(`/api/v1/habits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(req),
  });
  return json.data[0];
}

export async function archiveHabit(id: string): Promise<void> {
  await apiFetch(`/api/v1/habits/${id}`, { method: 'DELETE' });
}

// ── Completion Logging ────────────────────────────────────────────────────

export interface LogRequest {
  habitId: string;
  subHabitId?: string;
  date: string;       // YYYY-MM-DD
  completed: boolean;
  loggedAt: string;   // ISO 8601
}

export async function logCompletion(req: LogRequest): Promise<HabitResponse> {
  const json = await apiFetch<PageResponse<HabitResponse>>('/api/v1/logs', {
    method: 'POST',
    body: JSON.stringify(req),
  });
  return json.data[0];
}

export async function getHabitHistory(
  habitId: string,
  page = 0,
  size = 30,
): Promise<HabitLogEntry[]> {
  const json = await apiFetch<PageResponse<HabitLogEntry>>(
    `/api/v1/habits/${habitId}/logs?page=${page}&size=${size}`,
  );
  return json.data;
}

// ── Statistics ────────────────────────────────────────────────────────────

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate30Days: number;
}

export async function getHabitStats(habitId: string): Promise<HabitStats> {
  const json = await apiFetch<PageResponse<HabitStats>>(`/api/v1/habits/${habitId}/stats`);
  return json.data[0];
}

export interface WeeklyStatEntry {
  date: string;
  count: number;
}

export async function getWeeklyStats(): Promise<WeeklyStatEntry[]> {
  const json = await apiFetch<PageResponse<WeeklyStatEntry>>('/api/v1/habits/stats/weekly');
  return json.data;
}

/**
 * Aggregated stats for the Dashboard summary card.
 * Derives from the local habit list since there is no dedicated endpoint.
 */
export function computeStatsSummary(habits: HabitResponse[]): StatsSummary {
  const active = habits.filter((h) => !h.archived);
  const completedToday = active.filter((h) => h.completedToday).length;
  const streaks = active.map((h) => h.currentStreak);
  const longest = active.map((h) => h.longestStreak);
  return {
    totalHabits: active.length,
    completedToday,
    currentStreak: Math.max(0, ...streaks),
    longestStreak: Math.max(0, ...longest),
    activeStreaks: streaks.filter((s) => s > 0).length,
  };
}
