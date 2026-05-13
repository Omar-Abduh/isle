import type { HabitResponse } from '@isle/shared'

interface Props {
  habit: HabitResponse
  onToggle: (id: string) => void
}

export default function HabitCard({ habit, onToggle }: Props) {
  return (
    <div
      className="min-h-[56px] flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl
        active:bg-muted active:scale-[0.98] transition-transform touch-manipulation select-none"
      onClick={() => onToggle(habit.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(habit.id) }}
      aria-label={`${habit.name}${habit.completedToday ? ', completed' : ''}`}
    >
      <input
        type="checkbox"
        checked={habit.completedToday}
        onChange={() => onToggle(habit.id)}
        className="w-6 h-6 rounded accent-primary pointer-events-none"
        aria-hidden
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{habit.name}</p>
        {habit.currentStreak > 0 && (
          <p className="text-xs text-muted-foreground">
            {habit.currentStreak} day streak
          </p>
        )}
      </div>
    </div>
  )
}
