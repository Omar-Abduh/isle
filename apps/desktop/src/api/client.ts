/**
 * api/client.ts — Authenticated HTTP client with automatic token refresh
 *
 * - Attaches Bearer token from in-memory authStore on every request
 * - On 401, attempts one silent refresh via /auth/refresh
 * - On refresh failure, clears session and redirects to /
 */
import { useAuthStore } from '../store/authStore';
import { useHabitStore } from '../store/habitStore';
import { loadRefreshToken, saveRefreshToken, removeRefreshToken } from '../lib/stronghold';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '');

let isRefreshing = false;
let refreshWaiters: Array<(token: string | null) => void> = [];

/** Drain the waiters queue after a refresh attempt */
function resolveRefreshWaiters(token: string | null) {
  refreshWaiters.forEach((cb) => cb(token));
  refreshWaiters = [];
}

async function doTokenRefresh(): Promise<string | null> {
  const refreshToken = await loadRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    await removeRefreshToken();
    useAuthStore.getState().logout();
    useHabitStore.getState().setHabits([]);
    return null;
  }

  const json = await res.json();
  const { accessToken, refreshToken: newRefreshToken } = json.data[0] as {
    accessToken: string;
    refreshToken: string;
    user?: {
      id: string;
      email: string;
      displayName?: string;
      timezone: string;
      pictureUrl?: string;
      joinedAt?: string;
    };
  };

  const { setAccessToken, setSession } = useAuthStore.getState();
  if (json.data[0]?.user) {
    setSession(json.data[0].user, accessToken);
  } else {
    setAccessToken(accessToken);
  }
  await saveRefreshToken(newRefreshToken);
  return accessToken;
}

export interface ApiError extends Error {
  status: number;
  body: unknown;
}

function makeApiError(status: number, body: unknown): ApiError {
  const err = new Error(`API error ${status}`) as ApiError;
  err.status = status;
  err.body = body;
  return err;
}

/**
 * Core fetch wrapper — used by authApi and habitApi.
 * Automatically retries with a fresh access token on 401.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('X-Timezone')) {
    headers.set('X-Timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401 && retry) {
    // Deduplicate concurrent refresh attempts
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await doTokenRefresh().finally(() => {
        isRefreshing = false;
        resolveRefreshWaiters(useAuthStore.getState().accessToken);
      });
      if (!newToken) {
        // Redirect to login
        window.location.href = '/';
        throw makeApiError(401, 'Session expired');
      }
    } else {
      // Wait for the ongoing refresh
      await new Promise<string | null>((resolve) => refreshWaiters.push(resolve));
    }
    return apiFetch<T>(endpoint, options, false);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw makeApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
