import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { 
  useGetTodayHabits, 
  useLogHabit, 
  useCreateHabit, 
  useUpdateHabit, 
  useDeleteHabit,
  getGetTodayHabitsQueryKey,
  getGetHabitHistoryQueryKey,
  getGetStatsSummaryQueryKey,
  getGetWeeklyStatsQueryKey
} from "../lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { HabitCard } from "@/components/habits/HabitCard";
import { HabitFormDialog } from "@/components/habits/HabitFormDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { pageVariants, staggerContainer } from "@/lib/animations";

export default function Dashboard() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: todayHabits, isLoading } = useGetTodayHabits();
  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();
  const logHabit = useLogHabit();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const todayStr = format(new Date(), "EEEE, MMMM do");

  const progress = useMemo(() => {
    if (!todayHabits) return { completed: 0, total: 0, percent: 0 };
    const due = todayHabits.filter(h => h.isDue);
    const completed = due.filter(h => h.habit.completedToday).length;
    const total = due.length;
    return {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [todayHabits]);

  const handleLogHabit = (habitId: string, completed: boolean, subHabitId?: string) => {
    logHabit.mutate({
      id: habitId,
      data: {
        date: format(new Date(), 'yyyy-MM-dd'),
        completed,
        subHabitId
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTodayHabitsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetHabitHistoryQueryKey(habitId) });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to log habit.", variant: "destructive" });
      }
    });
  };

  const handleFormSubmit = (data: any) => {
    if (editingHabitId) {
      updateHabit.mutate({
        id: editingHabitId,
        data
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetTodayHabitsQueryKey() });
          setFormOpen(false);
          setEditingHabitId(null);
          toast({ title: "Success", description: "Habit updated." });
        }
      });
    } else {
      createHabit.mutate({
        data
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetTodayHabitsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
          setFormOpen(false);
          toast({ title: "Success", description: "Habit created." });
        }
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      deleteHabit.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetTodayHabitsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
          toast({ title: "Deleted", description: "Habit has been deleted." });
        }
      });
    }
  };

  const openEditForm = (id: string) => {
    setEditingHabitId(id);
    setFormOpen(true);
  };

  const openCreateForm = () => {
    setEditingHabitId(null);
    setFormOpen(true);
  };

  const editingHabit = useMemo(() => {
    if (!editingHabitId || !todayHabits) return null;
    return todayHabits.find(h => h.habit.id === editingHabitId)?.habit || null;
  }, [editingHabitId, todayHabits]);

  const dueHabits = todayHabits?.filter(h => h.isDue) || [];

  return (
    <AppLayout>
      <motion.div 
        className="space-y-8"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{greeting}</h1>
            <p className="text-muted-foreground mt-1">{todayStr}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium">{progress.completed} / {progress.total} completed</span>
              <div className="w-32 h-2 bg-muted rounded-full mt-1 overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
            <Button onClick={openCreateForm} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Habit</span>
            </Button>
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : dueHabits.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence>
              {dueHabits.map((entry) => (
                <HabitCard 
                  key={entry.habit.id}
                  habit={entry.habit}
                  completedToday={entry.habit.completedToday}
                  onLog={(completed, subId) => handleLogHabit(entry.habit.id, completed, subId)}
                  onEdit={() => openEditForm(entry.habit.id)}
                  onDelete={() => handleDelete(entry.habit.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl bg-muted/20">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Plus className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No habits due today</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start building your ideal routine by adding your first habit.
            </p>
            <Button onClick={openCreateForm}>Create a Habit</Button>
          </div>
        )}

        <HabitFormDialog 
          open={formOpen} 
          onOpenChange={setFormOpen}
          habit={editingHabit}
          onSubmit={handleFormSubmit}
          isPending={createHabit.isPending || updateHabit.isPending}
        />
      </motion.div>
    </AppLayout>
  );
}
