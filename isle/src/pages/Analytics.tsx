import { motion } from "framer-motion";
import { useGetStatsSummary, useGetWeeklyStats } from "../lib/api-client";
import { AppLayout } from "@/components/layout/AppLayout";
import { WeeklyChart } from "@/components/habits/WeeklyChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, CalendarDays, Flame, CheckCircle2 } from "lucide-react";
import { pageVariants, staggerContainer, itemVariants } from "@/lib/animations";

export default function Analytics() {
  const { data: summary, isLoading: loadingSummary } = useGetStatsSummary();
  const { data: weekly, isLoading: loadingWeekly } = useGetWeeklyStats();

  return (
    <AppLayout>
      <motion.div 
        className="space-y-8"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Review your progress and consistency over time.</p>
        </header>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {loadingSummary ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
          ) : summary ? (
            <>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Habits</CardTitle>
                    <Activity className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.totalHabits}</div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Streaks</CardTitle>
                    <Flame className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.activeStreaks}</div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Longest Streak</CardTitle>
                    <CalendarDays className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.longestStreak}</div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">30-Day Rate</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(summary.completionRate30Days * 100)}%</div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          ) : null}
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingWeekly ? (
              <Skeleton className="h-[300px] w-full rounded-xl" />
            ) : weekly && weekly.length > 0 ? (
              <WeeklyChart data={weekly} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Not enough data yet
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
