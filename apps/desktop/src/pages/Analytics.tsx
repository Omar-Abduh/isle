import { motion } from "framer-motion";
import { useGetStatsSummary, useGetWeeklyStats, useListHabits } from "../lib/api-client";
import { AppLayout } from "@/components/layout/AppLayout";
import { WeeklyChart } from "@/components/habits/WeeklyChart";
import { Skeleton } from "@/components/ui/skeleton";
import { StreakRing } from "@/components/habits/StreakRing";
import { Activity, CalendarDays, Flame, CheckCircle2, TrendingUp } from "lucide-react";
import { pageVariants, staggerContainer, itemVariants } from "@/lib/animations";

// ─── Stat Card ──────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: any; color: string; sub?: string;
}) {
  return (
    <motion.div variants={itemVariants}>
      <div className="bg-card border border-border/50 rounded-xl p-4 sm:p-5 flex items-center gap-3 hover:border-primary/20 transition-colors">
        <div className={`h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl sm:text-3xl font-bold text-foreground leading-none tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground/60 mt-1 truncate">{label}</p>
          {sub && <p className="text-[10px] text-muted-foreground/40 truncate">{sub}</p>}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ───────────────────────────────────────────────────────

export default function Analytics() {
  const { data: summary, isLoading: loadingSummary } = useGetStatsSummary();
  const { data: weekly, isLoading: loadingWeekly } = useGetWeeklyStats();
  const { data: habits, isLoading: loadingHabits } = useListHabits();

  const completionRate = summary && summary.totalHabits > 0
    ? Math.round((summary.completedToday / summary.totalHabits) * 100)
    : 0;

  const totalWeeklyCompletions = weekly?.reduce((a, b) => a + b.count, 0) ?? 0;

  return (
    <AppLayout>
      <motion.div 
        className="space-y-6 sm:space-y-8"
        initial="initial" animate="animate" exit="exit"
        variants={pageVariants}
      >
        {/* Header */}
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Review your progress and consistency over time.</p>
        </header>

        {/* Stat Cards */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          variants={staggerContainer}
          initial="hidden" animate="show"
        >
          {loadingSummary ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          ) : summary ? (
            <>
              <StatCard label="Total Habits" value={summary.totalHabits} icon={Activity} color="text-primary" />
              <StatCard label="Active Streaks" value={summary.activeStreaks} icon={Flame} color="text-amber-500" sub={`${summary.activeStreaks} of ${summary.totalHabits} active`} />
              <StatCard label="Best Streak" value={`${summary.longestStreak}d`} icon={CalendarDays} color="text-violet-500" sub="All-time longest" />
              <StatCard label="Today's Rate" value={`${completionRate}%`} icon={CheckCircle2} color="text-emerald-500" sub={`${summary.completedToday}/${summary.totalHabits} done`} />
            </>
          ) : null}
        </motion.div>

        {/* Weekly Chart */}
        <div className="bg-card border border-border/50 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Weekly Overview</h2>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Habit completions per day</p>
            </div>
            {weekly && (
              <div className="text-right">
                <p className="text-xl sm:text-2xl font-bold text-foreground leading-none">{totalWeeklyCompletions}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">this week</p>
              </div>
            )}
          </div>
          {loadingWeekly ? (
            <Skeleton className="h-56 w-full rounded-xl" />
          ) : weekly && weekly.length > 0 ? (
            <WeeklyChart data={weekly} />
          ) : (
            <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
              Not enough data yet
            </div>
          )}
        </div>

        {/* Per-Habit Streak Breakdown */}
        <div className="bg-card border border-border/50 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Habit Streaks</h2>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Individual streak progress</p>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground/40" />
          </div>

          {loadingHabits ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : habits && habits.length > 0 ? (
            <div className="space-y-2">
              {[...habits]
                .sort((a, b) => b.currentStreak - a.currentStreak)
                .map(habit => {
                  const streakPct = habit.longestStreak > 0
                    ? Math.round((habit.currentStreak / habit.longestStreak) * 100)
                    : 0;
                  return (
                    <div key={habit.id} className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <StreakRing
                        currentStreak={habit.currentStreak}
                        longestStreak={habit.longestStreak}
                        size={38}
                        strokeWidth={3}
                        color={habit.color}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{habit.name}</p>
                          <span className="text-xs font-bold text-foreground tabular-nums flex-shrink-0">{habit.currentStreak}d</span>
                        </div>
                        {/* Progress towards best */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, streakPct)}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: habit.color || 'var(--primary)' }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground/50 flex-shrink-0 tabular-nums">
                            best: {habit.longestStreak}d
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No habits yet.</p>
          )}
        </div>
      </motion.div>
    </AppLayout>
  );
}
