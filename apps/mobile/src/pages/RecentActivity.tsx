import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useHabitStore, pageVariants } from '@isle/shared'

export default function RecentActivityPage() {
  const navigate = useNavigate()
  const habits = useHabitStore((s) => s.habits)

  return (
    <motion.div
      className="px-4 pt-10 pb-28"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/profile')}
          className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Recent Activity</h1>
      </div>

      {habits.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No habits yet</p>
      ) : (
        <div className="space-y-3">
          {habits.map((h) => (
            <div
              key={h.id}
              className="flex items-center gap-3 py-3 px-3 rounded-lg bg-card border border-border/30"
            >
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: h.color || '#247E84' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{h.name}</p>
                <p className="text-[11px] text-muted-foreground/70">
                  {h.rrule.includes('DAILY') ? 'Daily' : h.rrule.includes('WEEKLY') ? 'Weekly' : 'Custom'} · {h.currentStreak}d streak
                </p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                h.completedToday
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-muted/50 text-muted-foreground'
              }`}>
                {h.completedToday ? 'Done' : 'Missed'}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
