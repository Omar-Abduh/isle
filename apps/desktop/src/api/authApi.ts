/**
 * authApi.ts — Auth endpoints (exchange, refresh, logout)
 * These are the only calls that do NOT require an existing access token.
 */
import { apiFetch } from './client';

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    displayName?: string;
    timezone: string;
    pictureUrl?: string;
    joinedAt?: string;
  };
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthTokensResponse['user'];
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '');

/**
 * Exchange an OAuth authorization code + PKCE verifier for app tokens.
 * Called from useOAuth after the deep-link callback is received.
 */
export async function exchangeCode(
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<AuthTokensResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, codeVerifier, redirectUri }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `Exchange failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data[0] as AuthTokensResponse;
}

/** Silent token rotation — called by api/client.ts on 401 */
export async function refreshTokens(refreshToken: string): Promise<RefreshResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error('Token refresh failed');
  const json = await res.json();
  return json.data[0] as RefreshResponse;
}

/** Revokes all refresh tokens server-side. Requires a valid access token. */
export async function logout(): Promise<void> {
  await apiFetch('/api/v1/auth/logout', { method: 'POST' });
}
