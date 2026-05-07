export type HabitType = 'POSITIVE' | 'NEGATIVE' | 'COMPOSITE'

export interface SubHabitDTO {
  id: string
  name: string
  sortOrder: number
}

export interface HabitResponse {
  id: string
  name: string
  description?: string
  habitType: HabitType
  rrule: string
  currentStreak: number
  longestStreak: number
  archived: boolean
  subHabits: SubHabitDTO[]
  createdAt: string
}

export interface HabitLogDTO {
  id: string
  logDate: string
  completed: boolean
  loggedAt: string
}

export interface HabitStatsDTO {
  currentStreak: number
  longestStreak: number
  totalCompletions: number
  completionRate30Days: number
}

export interface HabitRequest {
  name: string
  description?: string
  habitType: HabitType
  rrule: string
}

export interface LogRequest {
  habitId: string
  subHabitId?: string
  date: string       // YYYY-MM-DD
  completed: boolean
  loggedAt: string   // ISO 8601
}
