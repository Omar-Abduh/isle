/**
 * useOfflineSync.ts — Flushes the persisted offline queue when connectivity is restored.
 *
 * Strategy:
 *  - Entries made while offline are queued in offlineStore (persisted via Tauri Store).
 *  - On mount and on every "online" event, flush the queue in FIFO order.
 *  - Exponential backoff between retries: 1s, 2s, 4s, 8s, 16s.
 *  - MAX_RETRIES = 5 — entries are silently dropped after 5 consecutive failures.
 *  - React Query cache is invalidated after any successful flush.
 */
import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useOfflineStore } from '../store/offlineStore'
import { logCompletion } from '../api/habitApi'
import { getListHabitsQueryKey, getGetStatsSummaryQueryKey } from '../lib/api-client'

const MAX_RETRIES = 5

function backoffMs(retries: number): number {
  // 1s, 2s, 4s, 8s, 16s
  return Math.min(1000 * Math.pow(2, retries), 16_000)
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export function useOfflineSync(enabled = true) {
  const queryClient = useQueryClient()
  const { queue, dequeue, incrementRetry } = useOfflineStore()
  const isFlushing = useRef(false)
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

  const flush = useCallback(async () => {
    if (!enabled || isFlushing.current || (!isTauri && !navigator.onLine) || queue.length === 0) return
    isFlushing.current = true

    let anySucceeded = false

    for (const entry of [...queue]) {
      if (entry.retries >= MAX_RETRIES) {
        // Too many failures — discard silently to prevent infinite growth
        dequeue(entry.id)
        continue
      }

      try {
        await logCompletion({
          habitId: entry.habitId,
          subHabitId: entry.subHabitId,
          date: entry.date,
          completed: entry.completed,
          loggedAt: entry.loggedAt,
        })
        dequeue(entry.id)
        anySucceeded = true
      } catch {
        incrementRetry(entry.id)
        // Exponential backoff before attempting the next entry
        await sleep(backoffMs(entry.retries))
      }
    }

    if (anySucceeded) {
      await queryClient.invalidateQueries({ queryKey: getListHabitsQueryKey() })
      await queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() })
    }

    isFlushing.current = false
  }, [enabled, queue, dequeue, incrementRetry, queryClient])

  useEffect(() => {
    if (!enabled) return

    // Flush immediately on mount (handles app restart while online)
    void flush()

    const handleOnline = () => void flush()
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [enabled, flush])

  return {
    queueLength: queue.length,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    flushNow: flush,
  }
}
