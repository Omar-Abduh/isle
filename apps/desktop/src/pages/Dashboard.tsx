import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Plus, Check, ArrowUpDown, Flame, Target, TrendingUp, Activity } from "lucide-react";
import { 
  useGetTodayHabits, 
  useLogHabit, 
  useCreateHabit, 
  useUpdateHabit, 
  useDeleteHabit,
  useGetUserProfile,
  useGetStatsSummary,
  useGetWeeklyStats,
  getGetTodayHabitsQueryKey,
  getGetHabitHistoryQueryKey,
  getGetStatsSummaryQueryKey
} from "../lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { SortableHabitCard, HabitCardDragOverlay } from "@/components/habits/HabitCard";
import { HabitFormDrawer } from "@/components/habits/HabitFormDrawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { usePreferences } from "@/hooks/use-preferences";
import { pageVariants, staggerContainer } from "@/lib/animations";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// ─── Types ──────────────────────────────────────────────────────

type SortOption = 'manual' | 'name' | 'streak' | 'newest';
type FilterOption = 'today' | 'daily' | 'weekly' | 'monthly' | 'all';

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'manual', label: 'Manual' },
  { key: 'name', label: 'A → Z' },
  { key: 'streak', label: 'Streak' },
  { key: 'newest', label: 'Newest' },
];

const FILTER_OPTIONS: { key: FilterOption; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'all', label: 'All' },
];

// ─── Randomized Contextual Greeting ─────────────────────────────

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

type TimeSlot = 'fajr' | 'earlyMorning' | 'midMorning' | 'dhuhr' | 'asr' | 'preMAghrib' | 'maghrib' | 'isha' | 'night';

function getTimeSlot(hour: number): TimeSlot {
  if (hour >= 4 && hour < 6) return 'fajr';
  if (hour >= 6 && hour < 9) return 'earlyMorning';
  if (hour >= 9 && hour < 12) return 'midMorning';
  if (hour >= 12 && hour < 14) return 'dhuhr';
  if (hour >= 14 && hour < 16) return 'asr';
  if (hour >= 16 && hour < 18) return 'preMAghrib';
  if (hour >= 18 && hour < 20) return 'maghrib';
  if (hour >= 20 && hour < 22) return 'isha';
  return 'night';
}

const ISLAMIC_SUBTITLES: Record<TimeSlot, string[]> = {
  fajr: [
    'Time for Fajr. Start your day with intention.',
    'The early hours carry barakah. Rise and shine.',
    'Fajr is calling. Begin with bismillah.',
  ],
  earlyMorning: [
    'Your morning routine awaits. Make it count.',
    'The best part of the day is just beginning.',
    'A blessed morning. Set your priorities.',
  ],
  midMorning: [
    'Stay focused. You\'re building something great.',
    'Keep the momentum from this morning\'s worship.',
    'Halfway to Dhuhr. Stay productive.',
  ],
  dhuhr: [
    'Dhuhr time. Take a moment to recenter.',
    'Pause for Dhuhr, then continue building.',
    'Midday reset. Pray and refocus.',
  ],
  asr: [
    'Asr is approaching. Keep the momentum.',
    'The afternoon is golden. Don\'t waste it.',
    'Asr time soon. Finish what matters.',
  ],
  preMAghrib: [
    'Wind down your tasks before Maghrib.',
    'Maghrib approaches. Wrap up your work.',
    'Make dua before the sun sets.',
  ],
  maghrib: [
    'Maghrib time. Reflect on your day.',
    'The day is winding down. How did you do?',
    'Pray Maghrib and review your progress.',
  ],
  isha: [
    'Isha time. Complete your remaining habits.',
    'Final stretch. Finish strong before bed.',
    'Pray Isha and close out the day well.',
  ],
  night: [
    'Rest well. Tomorrow is a fresh start.',
    'Good night. Your habits will be waiting.',
    'Sleep is part of the routine. Rest up.',
  ],
};

const NEUTRAL_SUBTITLES: Record<TimeSlot, string[]> = {
  fajr: [
    'Early bird gets the habits done.',
    'The quiet hours are yours. Make them count.',
    'A fresh start to a new day.',
  ],
  earlyMorning: [
    'Your morning routine awaits. Make it count.',
    'The best part of the day is just beginning.',
    'Start strong, finish stronger.',
  ],
  midMorning: [
    'Stay focused. You\'re building something great.',
    'Deep work hours. Minimize distractions.',
    'Consistency beats intensity. Keep going.',
  ],
  dhuhr: [
    'Midday check-in. How are your habits looking?',
    'Take a break, then keep building.',
    'Lunchtime reset. Refuel and refocus.',
  ],
  asr: [
    'Afternoon push. Keep the momentum.',
    'The afternoon is golden. Don\'t waste it.',
    'You\'re past the halfway mark. Keep going.',
  ],
  preMAghrib: [
    'Wind down your tasks for the evening.',
    'Golden hour. Wrap up and reflect.',
    'Almost evening. How did today go?',
  ],
  maghrib: [
    'Evening check-in. Review your progress.',
    'The day is winding down. How did you do?',
    'Sunset mode. Time to reflect.',
  ],
  isha: [
    'Final stretch. Complete your remaining habits.',
    'Night routine time. Finish strong.',
    'Last call for today\'s habits.',
  ],
  night: [
    'Rest well. Tomorrow is a fresh start.',
    'Good night. Your habits will be waiting.',
    'Sleep is part of the routine. Rest up.',
  ],
};

const GREETING_PREFIX: Record<TimeSlot, string> = {
  fajr: 'Good morning',
  earlyMorning: 'Good morning',
  midMorning: 'Good morning',
  dhuhr: 'Good afternoon',
  asr: 'Good afternoon',
  preMAghrib: 'Good afternoon',
  maghrib: 'Good evening',
  isha: 'Good evening',
  night: 'Good night',
};

function getTimeGreeting(name?: string, islamic: boolean = true): { greeting: string; subtitle: string } {
  const slot = getTimeSlot(new Date().getHours());
  const firstName = name?.split(' ')[0] || '';
  const nameStr = firstName ? `, ${firstName}` : '';
  const pool = islamic ? ISLAMIC_SUBTITLES[slot] : NEUTRAL_SUBTITLES[slot];

  return {
    greeting: `${GREETING_PREFIX[slot]}${nameStr}`,
    subtitle: pick(pool),
  };
}

// ─── Frequency helpers ──────────────────────────────────────────

function getHabitFrequencyType(rrule: string): 'daily' | 'weekly' | 'monthly' {
  if (rrule.startsWith('FREQ=WEEKLY')) return 'weekly';
  if (rrule.startsWith('FREQ=MONTHLY')) return 'monthly';
  return 'daily';
}

function isDueToday(rrule: string): boolean {
  const now = new Date();
  const dayOfWeek = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][now.getDay()];
  const dayOfMonth = now.getDate();

  if (rrule === 'FREQ=DAILY') return true;

  if (rrule.startsWith('FREQ=WEEKLY')) {
    const match = rrule.match(/BYDAY=([^;]+)/);
    if (!match) return true;
    return match[1].split(',').includes(dayOfWeek);
  }

  if (rrule.startsWith('FREQ=MONTHLY')) {
    const match = rrule.match(/BYMONTHDAY=(\d+)/);
    if (!match) return true;
    const target = parseInt(match[1], 10);
    // Handle months with fewer days
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return dayOfMonth === Math.min(target, lastDay);
  }

  return true;
}

// ─── Time progress gradient ─────────────────────────────────────

function getDayProgress(): number {
  const now = new Date();
  return Math.round(((now.getHours() * 60 + now.getMinutes()) / 1440) * 100);
}

// ─── Component ──────────────────────────────────────────────────

export default function Dashboard() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('manual');
  const [filterBy, setFilterBy] = useState<FilterOption>('today');
  const [manualOrder, setManualOrder] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: todayHabits, isLoading } = useGetTodayHabits();
  const { data: profile } = useGetUserProfile();
  const { data: stats } = useGetStatsSummary();
  const { data: weeklyStats } = useGetWeeklyStats();
  const { prefs } = usePreferences();
  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();
  const logHabit = useLogHabit();

  // ─── DnD ───
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // ─── Derived ───
  const { greeting, subtitle } = useMemo(() => getTimeGreeting(profile?.displayName, prefs.islamicMessages), [profile?.displayName, prefs.islamicMessages]);
  const todayStr = format(new Date(), "EEEE, MMMM do");
  const dayProgress = useMemo(getDayProgress, []);

  const dueHabits = useMemo(() => todayHabits?.filter(h => h.isDue) || [], [todayHabits]);

  const progress = useMemo(() => {
    const completed = dueHabits.filter(h => h.habit.completedToday).length;
    const total = dueHabits.length;
    return {
      completed, total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      allDone: total > 0 && completed === total,
    };
  }, [dueHabits]);

  // Sync manual order
  useMemo(() => {
    if (dueHabits.length > 0 && manualOrder.length === 0) {
      setManualOrder(dueHabits.map(h => h.habit.id));
    }
    const currentIds = dueHabits.map(h => h.habit.id);
    const newIds = currentIds.filter(id => !manualOrder.includes(id));
    if (newIds.length > 0) {
      setManualOrder(prev => [...prev, ...newIds]);
    }
  }, [dueHabits]);

  // ─── Sort & Filter ───
  const processedHabits = useMemo(() => {
    let result = [...dueHabits];

    // Filter
    switch (filterBy) {
      case 'today':
        result = result.filter(h => isDueToday(h.habit.rrule || 'FREQ=DAILY'));
        break;
      case 'daily':
        result = result.filter(h => getHabitFrequencyType(h.habit.rrule || '') === 'daily');
        break;
      case 'weekly':
        result = result.filter(h => getHabitFrequencyType(h.habit.rrule || '') === 'weekly');
        break;
      case 'monthly':
        result = result.filter(h => getHabitFrequencyType(h.habit.rrule || '') === 'monthly');
        break;
      // 'all' — no filter
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.habit.name.localeCompare(b.habit.name));
        break;
      case 'streak':
        result.sort((a, b) => b.habit.currentStreak - a.habit.currentStreak);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.habit.createdAt).getTime() - new Date(a.habit.createdAt).getTime());
        break;
      case 'manual':
        result.sort((a, b) => {
          const ai = manualOrder.indexOf(a.habit.id);
          const bi = manualOrder.indexOf(b.habit.id);
          return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        });
        break;
    }

    return result;
  }, [dueHabits, filterBy, sortBy, manualOrder]);

  // ─── DnD Handlers ───
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSortBy('manual');
    setManualOrder((prev) => {
      const oldIndex = prev.indexOf(active.id as string);
      const newIndex = prev.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  // Active drag item
  const activeHabit = useMemo(() => {
    if (!activeId) return null;
    return dueHabits.find(h => h.habit.id === activeId)?.habit || null;
  }, [activeId, dueHabits]);

  // ─── Handlers ───
  const handleLogHabit = (habitId: string, completed: boolean, subHabitId?: string) => {
    logHabit.mutate({
      id: habitId,
      data: { date: format(new Date(), 'yyyy-MM-dd'), completed, subHabitId }
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
      updateHabit.mutate({ id: editingHabitId, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetTodayHabitsQueryKey() });
          setFormOpen(false);
          setEditingHabitId(null);
          toast({ title: "Success", description: "Habit updated." });
        }
      });
    } else {
      createHabit.mutate({ data }, {
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
    deleteHabit.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTodayHabitsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
        setManualOrder(prev => prev.filter(hid => hid !== id));
        toast({ title: "Deleted", description: "Habit has been deleted." });
      }
    });
  };

  const openEditForm = (id: string) => { setEditingHabitId(id); setFormOpen(true); };
  const openCreateForm = () => { setEditingHabitId(null); setFormOpen(true); };

  const editingHabit = useMemo(() => {
    if (!editingHabitId || !todayHabits) return null;
    return todayHabits.find(h => h.habit.id === editingHabitId)?.habit || null;
  }, [editingHabitId, todayHabits]);

  const habitIds = useMemo(() => processedHabits.map(h => h.habit.id), [processedHabits]);

  return (
    <AppLayout>
      <motion.div 
        className="space-y-5 sm:space-y-7"
        initial="initial" animate="animate" exit="exit"
        variants={pageVariants}
      >
        {/* ─── Header ─── */}
        <header className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{greeting}</h1>
              <p className="text-muted-foreground mt-0.5 text-sm">{subtitle}</p>
            </div>
            <Button onClick={openCreateForm} className="gap-2 hidden sm:flex">
              <Plus className="h-4 w-4" /> Add Habit
            </Button>
          </div>

          {/* Day progress + date */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground/60">{todayStr}</span>
            <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">{dayProgress}% of day</span>
          </div>
          <div className="w-full h-[2px] bg-muted/40 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary/30 via-primary to-primary/30 rounded-full" style={{ width: `${dayProgress}%` }} />
          </div>

          {/* Habit progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                {progress.allDone && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </motion.div>
                )}
                <span className={`text-sm font-medium ${progress.allDone ? 'text-emerald-500' : 'text-foreground'}`}>
                  {progress.allDone ? 'All done!' : `${progress.completed} / ${progress.total} completed`}
                </span>
              </div>
              <span className="text-xs text-muted-foreground/60">{progress.percent}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className={`h-full rounded-full transition-colors duration-500 ${progress.allDone ? 'bg-emerald-500' : 'bg-primary'}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress.percent}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Mobile Add Habit */}
          <Button onClick={openCreateForm} className="gap-2 w-full sm:hidden" size="lg">
            <Plus className="h-4 w-4" /> Add Habit
          </Button>
        </header>

        {/* ─── Stats Overview ─── */}
        {stats && (
          <div className="space-y-3">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: 'Total Habits', value: stats.totalHabits, icon: Target, color: 'text-primary' },
                { label: 'Best Streak', value: `${stats.longestStreak}d`, icon: Flame, color: 'text-amber-500' },
                { label: 'Active Streaks', value: stats.activeStreaks, icon: TrendingUp, color: 'text-emerald-500' },
                { label: 'Today', value: `${stats.completedToday}/${stats.totalHabits}`, icon: Activity, color: 'text-violet-500' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-card border border-border/50 rounded-xl p-3 sm:p-4 flex items-center gap-3 hover:border-primary/20 transition-colors">
                  <div className={`h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl font-bold text-foreground leading-none">{value}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-0.5 truncate">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 7-Day Mini Chart */}
            {weeklyStats && weeklyStats.length > 0 && (
              <div className="bg-card border border-border/50 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last 7 days</p>
                  <p className="text-[10px] text-muted-foreground/50">
                    {weeklyStats.reduce((a, b) => a + b.count, 0)} completions
                  </p>
                </div>
                <div className="flex items-end gap-1.5 h-16">
                  {weeklyStats.map((entry, i) => {
                    const maxCount = Math.max(1, ...weeklyStats.map(e => e.count));
                    const heightPct = Math.max(8, (entry.count / maxCount) * 100);
                    const isToday = i === weeklyStats.length - 1;
                    const dayLabel = new Date(entry.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' }).slice(0, 2);
                    return (
                      <div key={entry.date} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPct}%` }}
                          transition={{ duration: 0.4, delay: i * 0.05, ease: 'easeOut' }}
                          className={`w-full rounded-sm transition-colors ${
                            isToday
                              ? 'bg-primary'
                              : entry.count > 0 ? 'bg-primary/30' : 'bg-muted/60'
                          }`}
                        />
                        <span className={`text-[9px] leading-none ${isToday ? 'text-primary font-medium' : 'text-muted-foreground/40'}`}>
                          {dayLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Filter & Sort Toolbar ─── */}
        {dueHabits.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Frequency filter */}
            <div className="flex items-center gap-0.5 bg-muted/50 rounded-lg p-0.5 border border-border/40 overflow-x-auto">
              {FILTER_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterBy(key)}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                    filterBy === key
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-0.5 bg-muted/50 rounded-lg p-0.5 border border-border/40">
              <ArrowUpDown className="h-3 w-3 text-muted-foreground ml-2 mr-0.5 flex-shrink-0" />
              {SORT_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`text-[11px] font-medium px-2.5 py-1.5 rounded-md transition-all whitespace-nowrap ${
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

        {/* ─── Habit Cards ─── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        ) : processedHabits.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={habitIds} strategy={verticalListSortingStrategy}>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
                variants={staggerContainer}
                initial="hidden" animate="show"
              >
                {processedHabits.map((entry) => (
                  <SortableHabitCard 
                    key={entry.habit.id}
                    habit={entry.habit}
                    completedToday={entry.habit.completedToday}
                    onLog={(completed, subId) => handleLogHabit(entry.habit.id, completed, subId)}
                    onEdit={() => openEditForm(entry.habit.id)}
                    onDelete={() => handleDelete(entry.habit.id)}
                  />
                ))}
              </motion.div>
            </SortableContext>
            <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
              {activeHabit ? <HabitCardDragOverlay habit={activeHabit} /> : null}
            </DragOverlay>
          </DndContext>
        ) : dueHabits.length > 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground text-sm">No {filterBy === 'today' ? '' : filterBy + ' '}habits found.</p>
            <button onClick={() => setFilterBy('all')} className="text-primary text-sm font-medium mt-2 hover:underline">Show all</button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center border border-dashed border-border rounded-xl bg-muted/20">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Plus className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md text-sm px-4">Start building your ideal routine.</p>
            <Button onClick={openCreateForm}>Create a Habit</Button>
          </div>
        )}

        <HabitFormDrawer 
          open={formOpen} onOpenChange={setFormOpen}
          habit={editingHabit} onSubmit={handleFormSubmit}
          isPending={createHabit.isPending || updateHabit.isPending}
        />
      </motion.div>
    </AppLayout>
  );
}
