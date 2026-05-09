/**
 * use-auth.ts — Auth hook consumed by the whole app.
 *
 * Bridges between:
 *  - useAuthStore (in-memory access token + user)
 *  - Stronghold  (persisted refresh token, loaded on startup)
 *  - useOAuth    (PKCE login flow)
 *  - authApi     (server-side logout)
 *
 * On startup, if a refresh token exists in Stronghold, a silent refresh is
 * attempted so the user doesn't have to re-login after restarting the app.
 */
import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useHabitStore } from '../store/habitStore';
import { loadRefreshToken, removeRefreshToken } from '../lib/stronghold';
import { refreshTokens, logout as serverLogout } from '../api/authApi';
import { saveRefreshToken } from '../lib/stronghold';
import { useOAuth } from './useOAuth';

let authInitPromise: Promise<void> | null = null;

async function initialiseAuthSession(): Promise<void> {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) return;

  const storedRefreshToken = await loadRefreshToken();
  if (!storedRefreshToken) return;

  try {
    const {
      accessToken: newAccess,
      refreshToken: newRefresh,
      user: refreshedUser,
    } = await refreshTokens(storedRefreshToken);

    await saveRefreshToken(newRefresh);
    useAuthStore.getState().setSession(refreshedUser, newAccess);
  } catch {
    const { accessToken: currentAccess } = useAuthStore.getState();
    if (!currentAccess) {
      await removeRefreshToken();
      useAuthStore.getState().logout();
    }
  }
}

export function useAuth() {
  const { user, accessToken, logout: clearStore } = useAuthStore();
  const { startLogin, handleCallback } = useOAuth();
  const queryClient = useQueryClient();
  const [isInitialising, setIsInitialising] = useState(true);

  // ── Silent refresh on app start ─────────────────────────────────────────
  useEffect(() => {
    if (!authInitPromise) {
      authInitPromise = initialiseAuthSession();
    }

    void authInitPromise.finally(() => setIsInitialising(false));
  }, []);

  // ── Deep-link / Web-popup listener ─────────────────────────────────────────
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      // Setup Tauri deep-link listener + local HTTP server callback listener
      (async () => {
        try {
          const { getCurrent, onOpenUrl } = await import('@tauri-apps/plugin-deep-link');

          // Capture deep-link that launched the app (fires before onOpenUrl is registered)
          const startUrls = await getCurrent();
          if (startUrls) {
            const callbackUrl = startUrls.find((u) => u.startsWith('isle://auth/callback'));
            if (callbackUrl) {
              try {
                await handleCallback(callbackUrl);
              } catch (e) {
                console.error('OAuth callback failed:', e);
              }
            }
          }

          // Handle deep-links while the app is running
          unlisten = await onOpenUrl(async (urls: string[]) => {
            const callbackUrl = urls.find((u) => u.startsWith('isle://auth/callback'));
            if (callbackUrl) {
              try {
                await handleCallback(callbackUrl);
              } catch (e) {
                console.error('OAuth callback failed:', e);
              }
            }
          });
        } catch { /* not in Tauri environment */ }

        // Also listen for callbacks from the local HTTP OAuth server
        try {
          const { listen } = await import('@tauri-apps/api/event');
          const oauthUnlisten = await listen<{ code: string; state: string }>(
            'oauth-code-received',
            async (event) => {
              const { code, state } = event.payload;
                try {
                  await handleCallback(`?code=${code}&state=${state}`);
                } catch (e) {
                  console.error('OAuth callback from local server failed:', e);
                  alert(`OAuth failed: ${e instanceof Error ? e.message : e}`);
                }
            },
          );
          const prev = unlisten;
          unlisten = () => { prev?.(); oauthUnlisten(); };
        } catch { /* local server not available */ }
      })();
    } else {
      // Setup Web popup message listener
      const handleMessage = async (event: MessageEvent) => {
        const expectedOrigin = new URL(import.meta.env.VITE_REDIRECT_URI ?? 'http://localhost:8081/success.html').origin;
        if (event.origin === expectedOrigin && event.data?.type === 'oauth_callback') {
          const { code, state } = event.data;
          try {
            await handleCallback(`?code=${code}&state=${state}`);
          } catch (e) {
            console.error('OAuth callback failed:', e);
          }
        }
      };
      window.addEventListener('message', handleMessage);
      unlisten = () => window.removeEventListener('message', handleMessage);
    }

    return () => { unlisten?.(); };
  }, [handleCallback]);

  const login = useCallback(() => startLogin(), [startLogin]);

  const logout = useCallback(async () => {
    try {
      await serverLogout();
    } catch { /* ignore network error on logout */ }
    await removeRefreshToken();
    queryClient.clear();
    useHabitStore.getState().setHabits([]);
    clearStore();
  }, [clearStore, queryClient]);

  return {
    user,
    isAuthenticated: !!accessToken && !!user,
    isInitialising,
    login,
    logout,
    /** For web: call with the callback URL after redirect returns */
    handleOAuthCallback: handleCallback,
  };
}
