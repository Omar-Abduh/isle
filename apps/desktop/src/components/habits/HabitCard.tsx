import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, MoreHorizontal, Trash2, Pencil, BarChart3, GripVertical, X } from "lucide-react";
import { Link } from "wouter";
import { HabitResponse } from "../../lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StreakRing } from "./StreakRing";
import { itemVariants } from "@/lib/animations";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Types ──────────────────────────────────────────────────────

interface HabitCardProps {
  habit: HabitResponse;
  completedToday: boolean;
  onLog: (completed: boolean, subHabitId?: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────

const parseRRuleToText = (rrule: string) => {
  if (rrule === 'FREQ=DAILY') return 'Daily';
  if (rrule.startsWith('FREQ=WEEKLY')) {
    const days = rrule.match(/BYDAY=([^;]+)/);
    if (!days) return 'Weekly';
    const dayMap: Record<string, string> = { MO: 'Mon', TU: 'Tue', WE: 'Wed', TH: 'Thu', FR: 'Fri', SA: 'Sat', SU: 'Sun' };
    const selected = days[1].split(',').map(d => dayMap[d] || d);
    if (selected.length === 7) return 'Daily';
    if (selected.join(',') === 'Mon,Tue,Wed,Thu,Fri') return 'Weekdays';
    if (selected.join(',') === 'Sat,Sun') return 'Weekends';
    return `Weekly · ${selected.join(', ')}`;
  }
  if (rrule.startsWith('FREQ=MONTHLY')) {
    const match = rrule.match(/BYMONTHDAY=(\d+)/);
    if (match) {
      const day = parseInt(match[1], 10);
      const s = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
      return `Monthly · ${day}${s}`;
    }
    return 'Monthly';
  }
  return 'Custom';
};

function timeAgo(dateStr: string): string {
  const diffDay = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diffDay === 0) return 'Today';
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} weeks ago`;
  if (diffDay < 60) return '1 month ago';
  return `${Math.floor(diffDay / 30)} months ago`;
}

// ─── Sortable Wrapper ───────────────────────────────────────────

export function SortableHabitCard(props: HabitCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.habit.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 50 : 'auto' as any,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <HabitCard {...props} dragListeners={listeners} />
    </div>
  );
}

// ─── Drag Overlay ───────────────────────────────────────────────

export function HabitCardDragOverlay({ habit }: { habit: HabitResponse }) {
  return (
    <div className="pointer-events-none">
      <Card className="border-primary/30 bg-card shadow-2xl shadow-primary/10 ring-2 ring-primary/20">
        <CardContent className="p-4 flex items-center gap-3">
          <GripVertical className="h-4 w-4 text-primary/50 flex-shrink-0" />
          <div
            className="h-10 w-10 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
            style={{ borderColor: habit.color || 'var(--primary)' }}
          >
            {habit.completedToday && <Check className="h-5 w-5" style={{ color: habit.color || 'var(--primary)' }} />}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-base truncate">{habit.name}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{parseRRuleToText(habit.rrule || 'FREQ=DAILY')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Card ──────────────────────────────────────────────────

interface InternalProps extends HabitCardProps {
  dragListeners?: Record<string, unknown>;
}

function HabitCard({ habit, completedToday, onLog, onEdit, onDelete, dragListeners }: InternalProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isComposite = habit.habitType === 'COMPOSITE' && (habit.subHabits?.length ?? 0) > 0;

  return (
    <>
      <motion.div variants={itemVariants}>
        <Card 
          className={`group relative overflow-hidden transition-all duration-300 border-border bg-card hover:border-primary/30 hover:shadow-sm ${
            completedToday ? 'bg-primary/5 border-primary/20' : ''
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Accent bar */}
          <div className="absolute top-0 left-0 w-full h-[3px]" style={{ backgroundColor: habit.color || 'var(--primary)' }} />

          <CardContent className="p-4 sm:p-5 relative">

            {/* ─── Inline Action Overlay ─── */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="absolute inset-0 z-20 flex items-center justify-center rounded-[inherit]"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-[inherit]" />

                  <div className="relative z-10 flex items-center gap-6 sm:gap-8">
                    {([
                      { icon: Pencil, label: 'Edit', action: () => { setMenuOpen(false); onEdit(); }, destructive: false },
                      { icon: BarChart3, label: 'History', action: () => setMenuOpen(false), destructive: false, href: `/history/${habit.id}` },
                      { icon: Trash2, label: 'Delete', action: () => { setMenuOpen(false); setDeleteOpen(true); }, destructive: true },
                    ] as { icon: any; label: string; action: () => void; destructive: boolean; href?: string }[]).map((item) => {
                      const btn = (
                        <motion.button
                          key={item.label}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          onClick={(e) => { e.stopPropagation(); item.action(); }}
                          className="flex flex-col items-center gap-1.5"
                        >
                          <div className={`h-11 w-11 rounded-full flex items-center justify-center transition-colors ${
                            item.destructive 
                              ? 'bg-destructive/10 hover:bg-destructive/20' 
                              : 'bg-foreground/8 hover:bg-foreground/15'
                          }`}>
                            <item.icon className={`h-[18px] w-[18px] ${item.destructive ? 'text-destructive' : 'text-foreground'}`} />
                          </div>
                          <span className={`text-[10px] font-medium ${item.destructive ? 'text-destructive' : 'text-foreground/70'}`}>
                            {item.label}
                          </span>
                        </motion.button>
                      );
                      return item.href 
                        ? <Link key={item.label} href={item.href}>{btn}</Link> 
                        : <div key={item.label}>{btn}</div>;
                    })}
                  </div>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
                    className="absolute top-2.5 right-2.5 z-10 h-7 w-7 rounded-full bg-foreground/8 flex items-center justify-center hover:bg-foreground/15 transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-foreground/60" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── Card Content ─── */}
            <div className="flex items-start gap-3">
              {/* Drag handle */}
              <button
                {...dragListeners}
                className="flex-shrink-0 mt-1.5 cursor-grab active:cursor-grabbing text-muted-foreground/20 hover:text-muted-foreground/50 transition-colors touch-none"
                tabIndex={-1}
              >
                <GripVertical className="h-4 w-4" />
              </button>

              {/* Check-in (non-composite) */}
              {!isComposite && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onLog(!completedToday)}
                  className={`flex-shrink-0 mt-0.5 flex items-center justify-center h-11 w-11 rounded-full border-2 transition-all duration-300 ${
                    completedToday 
                      ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_12px_rgba(37,121,136,0.25)]' 
                      : 'bg-transparent border-muted-foreground/25 text-muted-foreground hover:border-primary hover:text-primary'
                  }`}
                >
                  {completedToday 
                    ? <Check className="h-5 w-5" /> 
                    : <Check className={`h-5 w-5 transition-opacity ${isHovered ? 'opacity-30' : 'opacity-0'}`} />
                  }
                </motion.button>
              )}

              {/* Title + description */}
              <div className="flex-1 min-w-0">
                <Link href={`/history/${habit.id}`} className="hover:underline decoration-primary decoration-2 underline-offset-4">
                  <h3 className={`text-base sm:text-lg font-semibold truncate transition-colors leading-tight ${
                    completedToday ? 'text-primary' : 'text-foreground'
                  }`}>
                    {habit.name}
                  </h3>
                </Link>
                {habit.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mt-0.5">
                    {habit.description}
                  </p>
                )}
              </div>

              {/* More button */}
              <button
                onClick={() => setMenuOpen(true)}
                className="flex-shrink-0 mt-1 h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Meta row: streak ring + frequency + created */}
            <div className="flex items-center gap-2.5 mt-3 ml-7">
              <StreakRing currentStreak={habit.currentStreak} longestStreak={habit.longestStreak} size={40} strokeWidth={3} color={habit.color} />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {parseRRuleToText(habit.rrule || 'FREQ=DAILY')}
                </span>
                <span className="text-[10px] text-muted-foreground/50">
                  Created {timeAgo(habit.createdAt)} · Best: {habit.longestStreak}
                </span>
              </div>
            </div>
            
            {/* Sub-tasks */}
            {isComposite && (
              <div className="mt-3 space-y-2 border-t border-border/50 pt-3 ml-7">
                {[...(habit.subHabits ?? [])].sort((a,b) => a.sortOrder - b.sortOrder).map(sub => (
                  <div key={sub.id} className="flex items-center space-x-3">
                    <Checkbox 
                      id={`sub-${sub.id}`} 
                      checked={sub.completedToday}
                      onCheckedChange={() => onLog(!(sub.completedToday ?? false), sub.id)}
                      className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label 
                      htmlFor={`sub-${sub.id}`} 
                      className={`text-sm font-medium leading-none cursor-pointer transition-colors ${
                        sub.completedToday ? 'text-muted-foreground line-through' : 'text-foreground'
                      }`}
                    >
                      {sub.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{habit.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this habit and all of its history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { onDelete(); setDeleteOpen(false); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { HabitCard };