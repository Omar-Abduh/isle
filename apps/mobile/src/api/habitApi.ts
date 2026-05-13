import { apiFetchAuthenticated } from './client'

export interface HabitResponse {
  id: string
  name: string
  description?: string
  habitType: 'POSITIVE' | 'NEGATIVE' | 'COMPOSITE'
  rrule: string
  currentStreak: number
  longestStreak: number
  archived: boolean
  color?: string
  icon?: string
  completedToday: boolean
  createdAt: string
  updatedAt: string
}

export interface WeeklyStatEntry {
  date: string
  count: number
}

export interface StatsSummary {
  totalHabits: number
  completedToday: number
  currentStreak: number
  longestStreak: number
  activeStreaks: number
}

export async function listHabits(): Promise<HabitResponse[]> {
  const json = await apiFetchAuthenticated<{ data: HabitResponse[] }>('/api/v1/habits')
  return json.data
}

export async function getTodayHabits(): Promise<{ habit: HabitResponse; isDue: boolean }[]> {
  const json = await apiFetchAuthenticated<{ data: { habit: HabitResponse; isDue: boolean }[] }>('/api/v1/habits/today')
  return json.data
}

export async function getWeeklyStats(): Promise<WeeklyStatEntry[]> {
  const json = await apiFetchAuthenticated<{ data: WeeklyStatEntry[] }>('/api/v1/habits/stats/weekly')
  return json.data
}

export async function getStatsSummary(): Promise<StatsSummary> {
  const json = await apiFetchAuthenticated<{ data: StatsSummary[] }>('/api/v1/habits/stats/summary')
  return json.data[0]
}

export async function getUserProfile(): Promise<{
  id: string
  email: string
  displayName?: string
  timezone: string
  pictureUrl?: string
  joinedAt?: string
}> {
  const json = await apiFetchAuthenticated<{ data: { id: string; email: string; displayName?: string; timezone: string; pictureUrl?: string; joinedAt?: string }[] }>('/api/v1/auth/profile')
  return json.data[0]
}

export async function updateProfile(data: { displayName?: string; timezone?: string }): Promise<void> {
  await apiFetchAuthenticated('/api/v1/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function logHabit(habitId: string, completed: boolean): Promise<void> {
  await apiFetchAuthenticated(`/api/v1/habits/${habitId}/log`, {
    method: 'POST',
    body: JSON.stringify({ date: new Date().toISOString().split('T')[0], completed }),
  })
}
