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
            <h1 className="text-2xl font-bold">{habit.name}</h1>
          ) : (
            <h1 className="text-2xl font-bold">Habit not found</h1>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>30-Day History</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <Skeleton className="h-32 w-full" />
            ) : history ? (
              <div className="py-4">
                <HabitHistoryGrid logs={history} days={30} />
                <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground max-w-sm">
                  <span>Less</span>
                  <div className="flex gap-2">
                    <div className="w-4 h-4 bg-muted/50 border border-border/50 rounded-sm"></div>
                    <div className="w-4 h-4 bg-primary/90 border border-primary/20 rounded-sm"></div>
                  </div>
                  <span>More</span>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
