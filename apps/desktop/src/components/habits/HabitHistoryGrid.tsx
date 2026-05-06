import { format, subDays } from "date-fns";
import { HabitLogEntry } from "../../lib/api-client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    if (dateMap.has(log.date)) {
      const entry = dateMap.get(log.date);
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
                    ? 'shadow-sm' 
                    : 'bg-muted/50 border-border/50 hover:border-border'
                }`}
                style={entry.completed ? { backgroundColor: color, borderColor: `${color}40` } : {}}
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
