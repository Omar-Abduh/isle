import { useState } from "react";
import { motion } from "framer-motion";
import { Check, MoreVertical, Trash, Edit, RefreshCw, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { HabitResponse } from "../../lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StreakRing } from "./StreakRing";
import { itemVariants } from "@/lib/animations";

interface HabitCardProps {
  habit: HabitResponse;
  completedToday: boolean;
  onLog: (completed: boolean, subHabitId?: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

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
    return `Weekly on ${selected.join(', ')}`;
  }
  if (rrule.startsWith('FREQ=MONTHLY')) {
    const match = rrule.match(/BYMONTHDAY=(\d+)/);
    if (match) return `Monthly on the ${match[1]}`;
    return 'Monthly';
  }
  return 'Custom';
};

export function HabitCard({ habit, completedToday, onLog, onEdit, onDelete }: HabitCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isComposite = habit.habitType === 'COMPOSITE' && (habit.subHabits?.length ?? 0) > 0;

  const handleCheckIn = () => {
    onLog(!completedToday);
  };

  const handleSubHabitToggle = (subHabitId: string, currentCompleted: boolean) => {
    onLog(!currentCompleted, subHabitId);
  };

  return (
    <motion.div variants={itemVariants} layoutId={`habit-${habit.id}`}>
      <Card 
        className={`group relative overflow-hidden transition-all duration-300 border-border bg-card hover:border-primary/30 hover:shadow-sm ${completedToday ? 'bg-primary/5 border-primary/20' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <Link href={`/history/${habit.id}`} className="hover:underline decoration-primary decoration-2 underline-offset-4">
                  <h3 className={`text-lg font-semibold truncate transition-colors ${completedToday ? 'text-primary' : 'text-foreground'}`}>
                    {habit.name}
                  </h3>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/history/${habit.id}`} className="flex items-center cursor-pointer">
                         <BarChart3 className="mr-2 h-4 w-4" />
                         History
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {habit.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {habit.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <StreakRing currentStreak={habit.currentStreak} longestStreak={habit.longestStreak} size={40} strokeWidth={3} />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{parseRRuleToText(habit.rrule || 'FREQ=DAILY')}</span>
                    <span className="text-[10px] text-muted-foreground">Best Streak: {habit.longestStreak}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {!isComposite && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCheckIn}
                className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full border-2 transition-all duration-300 ${
                  completedToday 
                    ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(37,121,136,0.3)]' 
                    : 'bg-transparent border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary'
                }`}
              >
                {completedToday ? <Check className="h-6 w-6" /> : <RefreshCw className={`h-5 w-5 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`} />}
              </motion.button>
            )}
          </div>
          
          {isComposite && (
            <div className="mt-2 space-y-2 border-t border-border pt-4">
              {[...(habit.subHabits ?? [])].sort((a,b) => a.sortOrder - b.sortOrder).map(sub => (
                <div key={sub.id} className="flex items-center space-x-3">
                  <Checkbox 
                    id={`sub-${sub.id}`} 
                    checked={sub.completedToday}
                    onCheckedChange={() => handleSubHabitToggle(sub.id, sub.completedToday ?? false)}
                    className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label 
                    htmlFor={`sub-${sub.id}`} 
                    className={`text-sm font-medium leading-none cursor-pointer transition-colors ${sub.completedToday ? 'text-muted-foreground line-through' : 'text-foreground'}`}
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
  );
}