import { useHabitStore } from '@isle/shared'

export default function DashboardPage() {
  const habits = useHabitStore((s) => s.habits)
  const completed = habits.filter((h) => h.completedToday).length
  const total = habits.length

  return (
    <div className="px-4 py-3" role="region" aria-label="Analytics dashboard">
      <h1 className="text-xl font-bold mb-4">ANALYTICS</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 bg-card border border-border rounded-xl text-center min-h-[88px] flex flex-col justify-center">
          <p className="text-2xl font-bold text-primary">{completed}</p>
          <p className="text-xs text-muted-foreground">Completed Today</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl text-center min-h-[88px] flex flex-col justify-center">
          <p className="text-2xl font-bold text-secondary-foreground">{total}</p>
          <p className="text-xs text-muted-foreground">Total Habits</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="font-semibold mb-2">Streaks</h2>
        {habits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No streak data</p>
        ) : (
          <ul className="space-y-2" role="list" aria-label="Streak list">
            {habits.map((h) => (
              <li
                key={h.id}
                className="flex justify-between items-center py-1"
              >
                <span className="text-sm truncate pr-2">{h.name}</span>
                <span className="text-primary font-medium text-sm whitespace-nowrap">
                  {h.currentStreak}d
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
