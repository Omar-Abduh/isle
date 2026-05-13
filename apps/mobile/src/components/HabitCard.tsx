import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MoreHorizontal, Pencil, BarChart3, Trash2, X, Check } from 'lucide-react'
import type { HabitResponse } from '@isle/shared'

interface Props {
  habit: HabitResponse
  onToggle: (id: string) => void
  onEdit: (habit: HabitResponse) => void
  onDelete: (habit: HabitResponse) => void
  onViewHistory: (habit: HabitResponse) => void
}

function timeAgo(dateStr: string): string {
  const diffDay = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (diffDay === 0) return 'Today'
  if (diffDay === 1) return 'Yesterday'
  if (diffDay < 7) return `${diffDay} days ago`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} weeks ago`
  if (diffDay < 60) return '1 month ago'
  return `${Math.floor(diffDay / 30)} months ago`
}

function parseRRule(rrule: string): string {
  if (rrule === 'FREQ=DAILY') return 'Daily'
  if (rrule.startsWith('FREQ=WEEKLY')) return 'Weekly'
  if (rrule.startsWith('FREQ=MONTHLY')) return 'Monthly'
  return 'Custom'
}

export default function HabitCard({ habit, onToggle, onEdit, onDelete, onViewHistory }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  const actions = [
    { icon: Pencil, label: 'Edit', action: () => { setMenuOpen(false); onEdit(habit) } },
    { icon: BarChart3, label: 'History', action: () => { setMenuOpen(false); onViewHistory(habit) } },
    { icon: Trash2, label: 'Delete', action: () => { setMenuOpen(false); onDelete(habit) }, destructive: true },
  ]

  return (
    <div className="relative bg-card border border-border/50 rounded-xl p-4 min-h-[80px] overflow-hidden">
      <div className="flex items-start gap-3">
        <div
          className="w-1 h-12 rounded-full shrink-0 mt-1"
          style={{ backgroundColor: habit.color || 'var(--primary)' }}
        />
        <button
          className="flex items-start gap-3 flex-1 min-w-0 text-left"
          onClick={() => onToggle(habit.id)}
          aria-label={`${habit.name}${habit.completedToday ? ', completed' : ''}`}
        >
          <div
            className={`shrink-0 mt-0.5 flex items-center justify-center h-7 w-7 rounded-full border-2 transition-all duration-300 ${
              habit.completedToday
                ? 'bg-primary border-primary text-primary-foreground'
                : 'bg-transparent border-muted-foreground/25 text-muted-foreground'
            }`}
          >
            {habit.completedToday && <Check className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <p className={`font-semibold text-[15px] leading-tight truncate ${
              habit.completedToday ? 'text-primary' : 'text-foreground'
            }`}>
              {habit.name}
            </p>
            {habit.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">{habit.description}</p>
            )}
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-muted-foreground/70">{parseRRule(habit.rrule || 'FREQ=DAILY')}</span>
              <span className="text-[10px] text-muted-foreground/40">·</span>
              <span className="text-[10px] text-muted-foreground/70">Best: {habit.longestStreak}</span>
            </div>
          </div>
        </button>
        <button
          onClick={() => setMenuOpen(true)}
          className="shrink-0 mt-1 h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="More actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-2.5 ml-7">
        <span className="text-xs text-muted-foreground/50">{timeAgo(habit.createdAt)}</span>
        {habit.currentStreak > 0 && (
          <>
            <span className="text-[10px] text-muted-foreground/30">·</span>
            <span className="text-xs font-medium text-primary">{habit.currentStreak}d streak</span>
          </>
        )}
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-0 z-20 flex items-center justify-center rounded-[inherit]"
            onClick={() => setMenuOpen(false)}
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-[inherit]" />

            <div className="relative z-10 flex items-center gap-5 sm:gap-6" onClick={(e) => e.stopPropagation()}>
              {actions.map((item) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  onClick={() => item.action()}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center transition-colors ${
                    item.destructive
                      ? 'bg-destructive/10 hover:bg-destructive/20'
                      : 'bg-foreground/8 hover:bg-foreground/15'
                  }`}>
                    <item.icon className={`h-[18px] w-[18px] ${item.destructive ? 'text-destructive' : 'text-foreground'}`} />
                  </div>
                  <span className={`text-[10px] font-medium ${item.destructive ? 'text-destructive' : 'text-foreground/70'}`}>
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setMenuOpen(false)}
              className="absolute top-2.5 right-2.5 z-10 h-7 w-7 rounded-full bg-foreground/8 flex items-center justify-center hover:bg-foreground/15 transition-colors"
            >
              <X className="h-3.5 w-3.5 text-foreground/60" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
