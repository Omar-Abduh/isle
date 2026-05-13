import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, ArrowUpDown } from 'lucide-react'
import {
  useHabitStore,
  HabitFormDrawer,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  pageVariants,
} from '@isle/shared'
import type { HabitResponse } from '@isle/shared'
import HabitCard from '../components/HabitCard'

type SortOption = 'manual' | 'name' | 'streak'
type FilterOption = 'today' | 'daily' | 'weekly' | 'monthly' | 'all'

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'manual', label: 'Manual' },
  { key: 'name', label: 'A → Z' },
  { key: 'streak', label: 'Streak' },
]

const FILTER_OPTIONS: { key: FilterOption; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'all', label: 'All' },
]

const GREETING_PREFIX: Record<string, string> = {
  fajr: 'Good morning', earlyMorning: 'Good morning', midMorning: 'Good morning',
  dhuhr: 'Good afternoon', asr: 'Good afternoon', preMaghrib: 'Good afternoon',
  maghrib: 'Good evening', isha: 'Good evening', night: 'Good night',
}

const SUBTITLES: Record<string, string[]> = {
  fajr: ['Time for Fajr. Start your day with intention.', 'The early hours carry barakah.'],
  earlyMorning: ['Your morning routine awaits. Make it count.', 'Start strong, finish stronger.'],
  midMorning: ['Stay focused. You\'re building something great.', 'Consistency beats intensity.'],
  dhuhr: ['Midday check-in. How are your habits looking?', 'Pause and refocus.'],
  asr: ['Afternoon push. Keep the momentum.', 'The afternoon is golden. Don\'t waste it.'],
  preMaghrib: ['Wind down your tasks for the evening.', 'Almost evening. Review your progress.'],
  maghrib: ['Evening check-in. How did you do today?', 'Reflect and prepare for tomorrow.'],
  isha: ['Final stretch. Complete your remaining habits.', 'Last call for today\'s habits.'],
  night: ['Rest well. Tomorrow is a fresh start.', 'Sleep is part of the routine.'],
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function getDayProgress(): number {
  const now = new Date()
  return Math.round(((now.getHours() * 60 + now.getMinutes()) / 1440) * 100)
}
function isDueToday(rrule: string): boolean {
  const now = new Date()
  const dayOfWeek = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][now.getDay()]
  if (rrule === 'FREQ=DAILY') return true
  if (rrule.startsWith('FREQ=WEEKLY')) {
    const match = rrule.match(/BYDAY=([^;]+)/)
    if (!match) return true
    return match[1].split(',').includes(dayOfWeek)
  }
  return true
}

export default function HabitsPage() {
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState<SortOption>('manual')
  const [filterBy, setFilterBy] = useState<FilterOption>('today')
  const [formOpen, setFormOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<HabitResponse | null>(null)
  const [deleteHabitId, setDeleteHabitId] = useState<HabitResponse | null>(null)

  const storeHabits = useHabitStore((s) => s.habits)
  const updateHabit = useHabitStore((s) => s.updateHabit)
  const removeHabit = useHabitStore((s) => s.removeHabit)

  const displayHabits = storeHabits
  const slot = (() => { const h = new Date().getHours(); if (h < 6) return 'fajr'; if (h < 9) return 'earlyMorning'; if (h < 12) return 'midMorning'; if (h < 14) return 'dhuhr'; if (h < 16) return 'asr'; if (h < 18) return 'preMaghrib'; if (h < 20) return 'maghrib'; if (h < 22) return 'isha'; return 'night' })()
  const greeting = `${GREETING_PREFIX[slot]}`
  const subtitle = pick(SUBTITLES[slot])
  const dayProgress = useMemo(getDayProgress, [])

  const completed = displayHabits.filter((h) => h.completedToday).length
  const total = displayHabits.length
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0
  const allDone = total > 0 && completed === total

  const filteredAndSorted = useMemo(() => {
    let result = [...displayHabits]
    if (filterBy === 'today') {
      result = result.filter((h) => isDueToday(h.rrule || 'FREQ=DAILY'))
    }
    if (filterBy === 'daily') {
      result = result.filter((h) => (h.rrule || '').startsWith('FREQ=DAILY'))
    }
    if (filterBy === 'weekly') {
      result = result.filter((h) => (h.rrule || '').startsWith('FREQ=WEEKLY'))
    }
    if (filterBy === 'monthly') {
      result = result.filter((h) => (h.rrule || '').startsWith('FREQ=MONTHLY'))
    }
    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === 'streak') result.sort((a, b) => b.currentStreak - a.currentStreak)
    return result
  }, [displayHabits, filterBy, sortBy])

  const handleToggle = useCallback((id: string) => {
    const habit = displayHabits.find((h) => h.id === id)
    if (habit) updateHabit(id, { completedToday: !habit.completedToday })
  }, [displayHabits, updateHabit])

  const handleEdit = useCallback((habit: HabitResponse) => {
    setEditingHabit(habit); setFormOpen(true)
  }, [])

  const handleDelete = useCallback((habit: HabitResponse) => {
    setDeleteHabitId(habit)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (deleteHabitId) { removeHabit(deleteHabitId.id); setDeleteHabitId(null) }
  }, [deleteHabitId, removeHabit])

  const handleViewHistory = useCallback((habit: HabitResponse) => {
    navigate(`/history/${habit.id}`)
  }, [navigate])

  const handleFormSubmit = useCallback(() => {
    setFormOpen(false); setEditingHabit(null)
  }, [])

  return (
    <motion.div
      className="px-4 pt-10 pb-28 space-y-5"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="region"
      aria-label="Today's habits"
    >
      <header className="space-y-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{greeting}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">{subtitle}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground/60">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
          <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">
            {dayProgress < 20 ? 'Just started' : dayProgress < 40 ? 'Morning hustle' : dayProgress < 60 ? 'Halfway' : dayProgress < 80 ? 'Winding down' : 'Almost done'}
          </span>
        </div>
        <div className="w-full h-[2px] bg-muted/40 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary/30 via-primary to-primary/30 rounded-full" style={{ width: `${dayProgress}%` }} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-sm font-medium ${allDone ? 'text-emerald-500' : 'text-foreground'}`}>
              {allDone ? 'All done!' : `${completed} / ${total} completed`}
            </span>
            <span className="text-xs text-muted-foreground/60">{progressPct}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${allDone ? 'bg-emerald-500' : 'bg-primary'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      </header>

      {displayHabits.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex bg-muted/50 rounded-lg p-0.5 border border-border/40">
            {FILTER_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterBy(key)}
                className={`flex-1 text-[11px] font-medium py-1.5 rounded-md text-center transition-all ${
                  filterBy === key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex bg-muted/50 rounded-lg p-0.5 border border-border/40">
            <ArrowUpDown className="h-3 w-3 text-muted-foreground ml-2 mr-1 shrink-0 self-center" />
            {SORT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`flex-1 text-[11px] font-medium py-1.5 rounded-md text-center transition-all ${
                  sortBy === key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {displayHabits.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-8">No habits yet</p>
      )}

      <ul className="space-y-3" role="list" aria-label="Habit list">
        {filteredAndSorted.map((habit) => (
          <li key={habit.id}>
            <HabitCard
              habit={habit}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewHistory={handleViewHistory}
            />
          </li>
        ))}
      </ul>

      <button
        onClick={() => { setEditingHabit(null); setFormOpen(true) }}
        className="fixed bottom-24 right-4 z-30 h-14 w-14 rounded-full bg-primary text-primary-foreground
          shadow-lg shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform"
        aria-label="Add habit"
      >
        <Plus className="h-6 w-6" />
      </button>

      <HabitFormDrawer
        open={formOpen}
        onOpenChange={setFormOpen}
        habit={editingHabit}
        onSubmit={handleFormSubmit}
        isPending={false}
      />

      <AlertDialog open={!!deleteHabitId} onOpenChange={(open) => { if (!open) setDeleteHabitId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this habit and all of its history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
