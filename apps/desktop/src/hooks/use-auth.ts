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
import { useAuthStore } from '../store/authStore';
import { loadRefreshToken, removeRefreshToken } from '../lib/stronghold';
import { refreshTokens, logout as serverLogout } from '../api/authApi';
import { saveRefreshToken } from '../lib/stronghold';
import { useOAuth } from './useOAuth';

export function useAuth() {
  const { user, accessToken, setSession, setAccessToken, logout: clearStore } = useAuthStore();
  const { startLogin, handleCallback } = useOAuth();
  const [isInitialising, setIsInitialising] = useState(true);

  // ── Silent refresh on app start ─────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const storedRefreshToken = await loadRefreshToken();
        if (storedRefreshToken && !accessToken) {
          const { accessToken: newAccess, refreshToken: newRefresh } =
            await refreshTokens(storedRefreshToken);
          // Rotate — save the new refresh token
          await saveRefreshToken(newRefresh);
          // We need the user from the existing store or we fetch a profile
          // For now, set access token; profile will be loaded by useGetUserProfile
          setAccessToken(newAccess);
        }
      } catch {
        // Refresh token is expired or invalid — user must re-login
        await removeRefreshToken();
        clearStore();
      } finally {
        setIsInitialising(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Deep-link listener (Tauri) ─────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !('__TAURI_INTERNALS__' in window)) return;
    let unlisten: (() => void) | undefined;

    (async () => {
      try {
        const { onOpenUrl } = await import('@tauri-apps/plugin-deep-link');
        unlisten = await onOpenUrl(async (urls: string[]) => {
          const callbackUrl = urls.find((u) =>
            u.startsWith('habittracker://auth/callback'),
          );
          if (callbackUrl) await handleCallback(callbackUrl);
        });
      } catch { /* not in Tauri environment */ }
    })();

    return () => { unlisten?.(); };
  }, [handleCallback]);

  const login = useCallback(() => startLogin(), [startLogin]);

  const logout = useCallback(async () => {
    try {
      await serverLogout();
    } catch { /* ignore network error on logout */ }
    await removeRefreshToken();
    clearStore();
  }, [clearStore]);

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
