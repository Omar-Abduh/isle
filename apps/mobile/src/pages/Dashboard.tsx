import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useHabitStore, WeeklyChart, pageVariants } from '@isle/shared'
import { getWeeklyStats } from '../api/habitApi'
import { CheckCircle2, TrendingUp, Flame, Activity } from 'lucide-react'
import { useState, useEffect } from 'react'

const statCards = [
  { label: 'Total Habits', icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Active Streaks', icon: Flame, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'Best Streak', icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { label: 'Completion Rate', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
]

export default function DashboardPage() {
  const habits = useHabitStore((s) => s.habits)
  const [weeklyData, setWeeklyData] = useState<{ date: string; count: number }[]>([])

  useEffect(() => {
    getWeeklyStats()
      .then(setWeeklyData)
      .catch(() => {})
  }, [])

  const completed = habits.filter((h) => h.completedToday).length
  const total = habits.length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  const statValues = useMemo(() => [
    total,
    habits.filter((h) => h.currentStreak > 0).length,
    Math.max(...habits.map((h) => h.longestStreak), 0),
    `${completionRate}%`,
  ], [habits, total, completionRate])

  return (
    <motion.div
      className="px-4 pt-10 pb-28 space-y-5"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="region"
      aria-label="Analytics"
    >
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review your progress and consistency over time.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-card border border-border/50 rounded-xl p-4 flex items-center gap-3"
            >
              <div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-foreground leading-none tracking-tight">
                  {statValues[i]}
                </p>
                <p className="text-[11px] text-muted-foreground/70 mt-1">
                  {card.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">This Week</h2>
        {weeklyData.length > 0 ? (
          <WeeklyChart data={weeklyData} />
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
        )}
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Streaks</h2>
        {habits.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No habits yet</p>
        ) : (
          <ul className="space-y-2" role="list" aria-label="Streak list">
            {habits
              .sort((a, b) => b.currentStreak - a.currentStreak)
              .map((h) => (
                <li key={h.id} className="flex justify-between items-center py-1">
                  <span className="text-sm text-foreground truncate pr-2">{h.name}</span>
                  <span className="text-primary font-medium text-sm whitespace-nowrap">
                    {h.currentStreak}d
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </motion.div>
  )
}
