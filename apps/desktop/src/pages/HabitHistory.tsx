import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useGetHabitHistory, useListHabits } from "../lib/api-client";
import { AppLayout } from "@/components/layout/AppLayout";
import { HabitHistoryGrid } from "@/components/habits/HabitHistoryGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { pageVariants } from "@/lib/animations";
import { StreakRing } from "@/components/habits/StreakRing";

export default function HabitHistory() {
  const { id } = useParams();
  
  // Find the habit from the list (no separate useGetHabit needed)
  const { data: allHabits, isLoading: loadingHabit } = useListHabits();
  const habit = allHabits?.find(h => h.id === id) ?? null;
  
  const { data: history, isLoading: loadingHistory } = useGetHabitHistory(id);

  if (!id) return null;

  return (
    <AppLayout>
      <motion.div 
        className="space-y-6"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          {loadingHabit ? (
            <Skeleton className="h-8 w-48" />
          ) : habit ? (
            <div className="flex flex-col">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase truncate max-w-[70vw]" style={{ color: habit.color || '#FFF' }}>
                {habit.name}
              </h1>
              <p className="text-sm font-medium text-muted-foreground mt-1 uppercase tracking-wider">
                Started {new Date(habit.createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <h1 className="text-2xl font-bold">Habit not found</h1>
          )}
        </div>

        {habit && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="col-span-1 md:col-span-2">
              <Card className="border-border shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    30-Day Contribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingHistory ? (
                    <Skeleton className="h-32 w-full" />
                  ) : history ? (
                    <div className="py-2">
                      <HabitHistoryGrid logs={history} days={30} color={habit.color} />
                      <div className="mt-8 flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground max-w-[200px]">
                        <span>Less</span>
                        <div className="flex gap-2">
                          <div className="w-4 h-4 bg-muted/50 border border-border/50 rounded-sm"></div>
                          <div className="w-4 h-4 shadow-sm rounded-sm" style={{ backgroundColor: habit.color || '#FFF', opacity: 0.8 }}></div>
                        </div>
                        <span>More</span>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
            
            <div className="col-span-1 space-y-6">
               <Card className="border-border shadow-sm">
                 <CardContent className="p-6 flex flex-col items-center text-center">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">Current Streak</h3>
                    <StreakRing currentStreak={habit.currentStreak} longestStreak={habit.longestStreak} size={140} strokeWidth={8} color={habit.color} />
                    <div className="mt-8">
                      <p className="text-5xl font-bold tracking-tighter" style={{ color: habit.color || '#FFF' }}>{habit.currentStreak}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-2">Days</p>
                    </div>
                 </CardContent>
               </Card>
               <Card className="border-border shadow-sm">
                 <CardContent className="p-6 flex flex-col items-center text-center">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Longest Streak</h3>
                    <p className="text-3xl font-bold tracking-tight text-foreground">{habit.longestStreak} <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Days</span></p>
                 </CardContent>
               </Card>
            </div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
