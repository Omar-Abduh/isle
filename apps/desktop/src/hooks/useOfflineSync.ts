/**
 * useOfflineSync.ts — Syncs the offline queue when connectivity is restored.
 *
 * Strategy:
 *  - Check-ins made while offline are queued in offlineStore (persisted to disk).
 *  - On mount and on every online event, flush the queue in FIFO order.
 *  - Each entry is retried up to MAX_RETRIES times; after that it is discarded.
 *  - React Query cache is invalidated after a successful flush so the UI refreshes.
 */
import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOfflineStore } from '../store/offlineStore';
import { logCompletion } from '../api/habitApi';
import { getListHabitsQueryKey, getGetStatsSummaryQueryKey } from '../lib/api-client';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

export function useOfflineSync() {
  const queryClient = useQueryClient();
  const { queue, dequeue, incrementRetry } = useOfflineStore();
  const isFlushing = useRef(false);

  const flush = useCallback(async () => {
    if (isFlushing.current || !navigator.onLine || queue.length === 0) return;
    isFlushing.current = true;

    let anySucceeded = false;

    for (const entry of [...queue]) {
      if (entry.retries >= MAX_RETRIES) {
        // Discard silently — too many failures
        dequeue(entry.id);
        continue;
      }
      try {
        await logCompletion({
          habitId: entry.habitId,
          subHabitId: entry.subHabitId,
          date: entry.date,
          completed: entry.completed,
          loggedAt: entry.loggedAt,
        });
        dequeue(entry.id);
        anySucceeded = true;
      } catch {
        incrementRetry(entry.id);
        // Back off before the next entry to avoid hammering a degraded API
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }

    if (anySucceeded) {
      // Invalidate so Dashboard and Analytics refresh
      await queryClient.invalidateQueries({ queryKey: getListHabitsQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
    }

    isFlushing.current = false;
  }, [queue, dequeue, incrementRetry, queryClient]);

  useEffect(() => {
    // Flush immediately on mount (handles app restart while online)
    void flush();

    const handleOnline = () => void flush();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [flush]);

  return {
    queueLength: queue.length,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    flushNow: flush,
  };
}
