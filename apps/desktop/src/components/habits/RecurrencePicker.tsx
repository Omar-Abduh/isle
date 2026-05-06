import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface RecurrencePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const DAYS = [
  { label: 'M', value: 'MO' },
  { label: 'T', value: 'TU' },
  { label: 'W', value: 'WE' },
  { label: 'T', value: 'TH' },
  { label: 'F', value: 'FR' },
  { label: 'S', value: 'SA' },
  { label: 'S', value: 'SU' },
];

export function RecurrencePicker({ value, onChange }: RecurrencePickerProps) {
  const [mode, setMode] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [selectedDays, setSelectedDays] = useState<string[]>(['MO', 'WE', 'FR']);
  const [monthDay, setMonthDay] = useState<number>(1);

  // Parse incoming value on mount
  useEffect(() => {
    if (!value) return;
    if (value.startsWith('FREQ=DAILY')) setMode('DAILY');
    else if (value.startsWith('FREQ=WEEKLY')) {
      setMode('WEEKLY');
      const match = value.match(/BYDAY=([^;]+)/);
      if (match) {
        setSelectedDays(match[1].split(','));
      }
    } else if (value.startsWith('FREQ=MONTHLY')) {
      setMode('MONTHLY');
      const match = value.match(/BYMONTHDAY=(\d+)/);
      if (match) {
        setMonthDay(parseInt(match[1], 10));
      }
    }
  }, [value]);

  const updateRRule = (newMode: string, days: string[], mDay: number) => {
    if (newMode === 'DAILY') {
      onChange('FREQ=DAILY');
    } else if (newMode === 'WEEKLY') {
      onChange(`FREQ=WEEKLY;BYDAY=${days.length > 0 ? days.join(',') : 'MO'}`);
    } else if (newMode === 'MONTHLY') {
      onChange(`FREQ=MONTHLY;BYMONTHDAY=${mDay}`);
    }
  };

  const handleModeChange = (newMode: 'DAILY' | 'WEEKLY' | 'MONTHLY') => {
    setMode(newMode);
    updateRRule(newMode, selectedDays, monthDay);
  };

  const toggleDay = (dayValue: string) => {
    const newDays = selectedDays.includes(dayValue)
      ? selectedDays.filter((d) => d !== dayValue)
      : [...selectedDays, dayValue];
    
    // Sort days according to M-S order to keep RRULE clean
    const sorted = DAYS.map(d => d.value).filter(d => newDays.includes(d));
    setSelectedDays(sorted);
    updateRRule('WEEKLY', sorted, monthDay);
  };

  const handleMonthDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= 31) {
      setMonthDay(val);
      updateRRule('MONTHLY', selectedDays, val);
    } else if (e.target.value === '') {
      // Allow clearing temporarily, but don't emit
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
        {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => handleModeChange(m)}
            className={cn(
              "flex-1 text-xs font-semibold py-2 px-3 rounded-md transition-all uppercase tracking-wider",
              mode === m 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="min-h-[50px] flex items-center justify-center bg-card border border-border/40 rounded-lg p-3">
        {mode === 'DAILY' && (
          <p className="text-sm text-muted-foreground">Habit repeats every day.</p>
        )}

        {mode === 'WEEKLY' && (
          <div className="flex items-center gap-2">
            {DAYS.map((day, idx) => {
              const isSelected = selectedDays.includes(day.value);
              return (
                <button
                  key={`${day.value}-${idx}`}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border",
                    isSelected 
                      ? "bg-primary text-primary-foreground border-transparent shadow-md scale-105" 
                      : "bg-background text-muted-foreground border-border hover:border-primary/50"
                  )}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        )}

        {mode === 'MONTHLY' && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Every month on the</span>
            <Input 
              type="number" 
              min={1} 
              max={31} 
              value={monthDay || ''} 
              onChange={handleMonthDayChange}
              className="w-16 h-8 text-center px-1 font-bold"
            />
          </div>
        )}
      </div>
    </div>
  );
}
