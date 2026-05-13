import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useHabitStore, WeeklyChart, StreakRing, pageVariants } from '@isle/shared'
import { getWeeklyStats } from '../api/habitApi'
import { useState, useEffect } from 'react'

export default function HabitHistoryPage() {
  const { habitId } = useParams<{ habitId: string }>()
  const navigate = useNavigate()
  const habits = useHabitStore((s) => s.habits)
  const habit = habits.find((h) => h.id === habitId)
  const [weeklyData, setWeeklyData] = useState<{ date: string; count: number }[]>([])

  useEffect(() => {
    getWeeklyStats()
      .then(setWeeklyData)
      .catch(() => {})
  }, [])

  if (!habit) {
    return (
      <div className="px-4 pt-10">
        <p className="text-muted-foreground text-sm">Habit not found</p>
        <button onClick={() => navigate('/')} className="text-primary text-sm mt-2">Go back</button>
      </div>
    )
  }

  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return {
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      completed: i % 3 !== 0,
    }
  })

  const completedCount = days.filter((d) => d.completed).length

  return (
    <motion.div
      className="px-4 pt-10 pb-28 space-y-5"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{habit.name}</h1>
          <p className="text-xs text-muted-foreground">
            {habit.rrule?.includes('DAILY') ? 'Daily' : 'Custom'} habit
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card border border-border/50 rounded-xl p-4">
        <StreakRing
          currentStreak={habit.currentStreak}
          longestStreak={habit.longestStreak}
          size={100}
          strokeWidth={6}
          color={habit.color}
        />
        <div className="flex-1 space-y-1">
          <p className="text-2xl font-bold text-foreground">{habit.currentStreak}d</p>
          <p className="text-xs text-muted-foreground">Current streak</p>
          <p className="text-xs text-muted-foreground/70">
            Best: {habit.longestStreak}d · {completedCount}/30 days
          </p>
        </div>
      </div>

      {weeklyData.length > 0 && (
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">This Week</h2>
          <WeeklyChart data={weeklyData} />
        </div>
      )}

      <div className="bg-card border border-border/50 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">30-Day Log</h2>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {days.map((day) => (
            <div
              key={day.date}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg"
            >
              <span className="text-xs text-foreground">{day.label}</span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  day.completed
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-muted/50 text-muted-foreground'
                }`}
              >
                {day.completed ? 'Done' : 'Missed'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
