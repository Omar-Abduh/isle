import type { WeeklyStatEntry } from "../../types/api";
import { motion } from "framer-motion";

interface WeeklyChartProps {
  data: WeeklyStatEntry[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const maxCount = Math.max(1, ...data.map(d => d.count));
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full">
      {/* Bars */}
      <div className="flex items-end gap-2 sm:gap-3 h-48 sm:h-56 px-1">
        {data.map((entry, i) => {
          const heightPct = Math.max(6, (entry.count / maxCount) * 100);
          const isToday = entry.date === today;
          const dayName = new Date(entry.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' });
          const dateLabel = new Date(entry.date + 'T12:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' });

          return (
            <div key={entry.date} className="flex-1 h-full flex flex-col items-center gap-2">
              {/* Count label */}
              <span className={`text-xs font-medium tabular-nums ${isToday ? 'text-primary' : 'text-muted-foreground/60'}`}>
                {entry.count}
              </span>

              {/* Bar */}
              <div className="w-full flex-1 flex items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`w-full rounded-t-md transition-colors ${
                    isToday
                      ? 'bg-primary'
                      : entry.count > 0
                        ? 'bg-primary/50'
                        : 'bg-muted/50'
                  }`}
                />
              </div>

              {/* Day label */}
              <div className="flex flex-col items-center">
                <span className={`text-[11px] font-medium ${isToday ? 'text-primary' : 'text-muted-foreground/70'}`}>
                  {dayName}
                </span>
                <span className="text-[9px] text-muted-foreground/40 hidden sm:block">
                  {dateLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
