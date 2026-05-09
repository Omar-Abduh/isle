import { format, subDays } from "date-fns";
import type { HabitLogEntry } from "../../types/api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";

interface HabitHistoryGridProps {
  logs: HabitLogEntry[];
  days?: number;
  color?: string;
}

export function HabitHistoryGrid({ logs, days = 30, color = "#247E84" }: HabitHistoryGridProps) {
  const today = new Date();
  
  // Generate last `days` dates
  const dateMap = new Map();
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    dateMap.set(format(date, 'yyyy-MM-dd'), { date, completed: false });
  }
  
  // Fill in completions
  logs.forEach(log => {
    const logDate = (log as any).logDate || log.date;
    if (dateMap.has(logDate)) {
      const entry = dateMap.get(logDate);
      entry.completed = log.completed;
    }
  });
  
  const datesArray = Array.from(dateMap.values());
  
  return (
    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
      <TooltipProvider>
        {datesArray.map((entry, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-sm transition-colors duration-300 border ${
                  entry.completed 
                    ? (color ? 'shadow-sm' : 'bg-primary border-primary shadow-sm')
                    : 'bg-muted/50 border-border/50 hover:border-border'
                }`}
                style={entry.completed && color ? { backgroundColor: color, borderColor: color, opacity: 0.9 } : {}}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm font-medium">
                {format(entry.date, 'MMM d, yyyy')}
              </p>
              <p className="text-xs text-muted-foreground">
                {entry.completed ? 'Completed' : 'Not completed'}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
