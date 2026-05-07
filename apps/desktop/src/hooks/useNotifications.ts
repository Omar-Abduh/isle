/**
 * useNotifications.ts — Daily habit reminder notifications
 *
 * On desktop (Tauri): uses native OS notifications via tauri-plugin-notification.
 * On web: uses the Web Notifications API with a polite permission request.
 *
 * A reminder is scheduled once per day at the user's preferred time (default 09:00).
 * The hook is idempotent — mounting it multiple times re-uses the same timer.
 */
import { useEffect, useRef } from 'react';

interface NotificationOptions {
  /** 24-hour time string, e.g. "09:00" (default) */
  reminderTime?: string;
  title?: string;
  body?: string;
}

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

function msUntil(timeStr: string): number {
  const now = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1); // next day
  return target.getTime() - now.getTime();
}

async function sendNotification(title: string, body: string): Promise<void> {
  if (isTauri()) {
    try {
      const {
        isPermissionGranted,
        requestPermission,
        sendNotification: tauriSend,
      } = await import('@tauri-apps/plugin-notification');
      let granted = await isPermissionGranted();
      if (!granted) {
        const perm = await requestPermission();
        granted = perm === 'granted';
      }
      if (granted) tauriSend({ title, body });
    } catch { /* tauri plugin not present in dev */ }
    return;
  }

  // Web Notifications fallback
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icon.png' });
  }
}

export function useNotifications({
  reminderTime = '09:00',
  title = 'Time for your habits! 🌿',
  body = 'Open Isle and check in for today.',
}: NotificationOptions = {}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function scheduleNext() {
      const delay = msUntil(reminderTime);
      timerRef.current = setTimeout(async () => {
        await sendNotification(title, body);
        scheduleNext(); // reschedule for the next day
      }, delay);
    }

    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [reminderTime, title, body]);
}
