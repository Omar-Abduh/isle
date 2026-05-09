/**
 * useNotifications.ts — Habit reminder notifications using tauri-plugin-notification.
 * Falls back to Web Notifications API in browser/dev mode.
 *
 * Fires at 9:00 AM local time if the user has habits with currentStreak === 0
 * (i.e. habits not yet completed today).
 */
import { useEffect, useRef } from 'react'
import { useHabitStore } from '../store/habitStore'

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

export function useNotifications() {
  const habits = useHabitStore((s) => s.habits)
  const habitsRef = useRef(habits)

  // Keep ref current so the interval closure always reads fresh data
  useEffect(() => { habitsRef.current = habits }, [habits])

  useEffect(() => {
    // Request permission once on mount
    const ensurePermission = async () => {
      if (isTauri()) {
        try {
          const { isPermissionGranted, requestPermission } =
            await import('@tauri-apps/plugin-notification')
          const granted = await isPermissionGranted()
          if (!granted) await requestPermission()
        } catch { /* plugin not present in browser mode */ }
        return
      }
      // Web Notifications API fallback
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission()
      }
    }
    void ensurePermission()
  }, [])

  useEffect(() => {
    // Check every minute; fire reminder at 09:00 local time
    const interval = setInterval(async () => {
      const now = new Date()
      if (now.getHours() !== 9 || now.getMinutes() !== 0) return

      const incomplete = habitsRef.current.filter(
        (h) => !h.archived && h.currentStreak === 0,
      )
      if (incomplete.length === 0) return

      const title = 'Time for your habits! 🌿'
      const body = `You have ${incomplete.length} habit${incomplete.length === 1 ? '' : 's'} to complete today!`

      if (isTauri()) {
        try {
          const { isPermissionGranted, sendNotification } =
            await import('@tauri-apps/plugin-notification')
          if (await isPermissionGranted()) {
            sendNotification({ title, body })
          }
        } catch { /* ignore */ }
      } else if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icon.png' })
      }
    }, 60_000)

    return () => clearInterval(interval)
  }, [])
}
