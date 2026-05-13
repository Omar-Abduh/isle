import { useHabitStore } from '@isle/shared'
import HabitCard from '../components/HabitCard'

export default function HabitsPage() {
  const habits = useHabitStore((s) => s.habits)
  const updateHabit = useHabitStore((s) => s.updateHabit)

  function handleToggle(id: string) {
    const habit = habits.find((h) => h.id === id)
    if (habit) {
      updateHabit(id, { completedToday: !habit.completedToday })
    }
  }

  return (
    <div className="px-4 py-3 space-y-2" role="region" aria-label="Today's habits">
      <h1 className="text-xl font-bold mb-4">TODAY</h1>
      {habits.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">
          No habits yet
        </p>
      ) : (
        <ul className="space-y-3" role="list" aria-label="Habit list">
          {habits.map((habit) => (
            <li key={habit.id}>
              <HabitCard habit={habit} onToggle={handleToggle} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
