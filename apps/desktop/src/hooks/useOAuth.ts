/**
 * useOAuth.ts — Full Google OAuth 2.0 PKCE flow for Tauri + web fallback
 *
 * Flow:
 *  1. generateChallenge()  — creates code_verifier + code_challenge (S256)
 *  2. openAuthUrl()        — opens Google's consent page in the system browser
 *  3. handleCallback()     — invoked when the deep-link lands with ?code=...
 *  4. exchangeCode()       — swaps code → access + refresh tokens via our API
 *  5. persist()            — access token → memory, refresh token → Stronghold
 */
import { useCallback, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { saveRefreshToken } from '../lib/stronghold';
import { exchangeCode } from '../api/authApi';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI as string; // e.g. https://your-vps/success.html
const SCOPES = 'openid email profile';

// ── PKCE helpers ─────────────────────────────────────────────────────────────

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(plain));
}

async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = base64url(await sha256(verifier));
  return { verifier, challenge };
}

function generateState(): string {
  return base64url(crypto.getRandomValues(new Uint8Array(16)));
}

// ── Tauri detection ───────────────────────────────────────────────────────────

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

interface OAuthState {
  verifier: string;
  state: string;
}

export function useOAuth() {
  const { setSession } = useAuthStore();
  // Persist PKCE state between the browser-open and deep-link return
  const pendingRef = useRef<OAuthState | null>(null);

  const startLogin = useCallback(async () => {
    const { verifier, challenge } = await generatePKCE();
    const state = generateState();
    pendingRef.current = { verifier, state };

    // Store in sessionStorage so it survives a brief browser focus loss
    sessionStorage.setItem('isle_pkce_verifier', verifier);
    sessionStorage.setItem('isle_pkce_state', state);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: SCOPES,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      access_type: 'offline',
      prompt: 'consent',
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

    if (isTauri()) {
      const { open } = await import('@tauri-apps/plugin-shell');
      await open(url);
    } else {
      window.open(url, '_blank', 'width=500,height=600');
    }
  }, []);

  /**
   * Call this when the deep-link / redirect delivers ?code=...&state=...
   * Works both from a Tauri deep-link listener and a web redirect.
   */
  const handleCallback = useCallback(async (callbackUrl: string) => {
    const params = new URLSearchParams(
      callbackUrl.includes('?') ? callbackUrl.split('?')[1] : callbackUrl,
    );
    const code  = params.get('code');
    const state = params.get('state');

    if (!code || !state) throw new Error('Missing code or state in callback');

    // Recover PKCE verifier from sessionStorage (survives focus switch)
    const verifier = sessionStorage.getItem('isle_pkce_verifier');
    const savedState = sessionStorage.getItem('isle_pkce_state');

    if (!verifier || !savedState) throw new Error('PKCE session expired. Please try again.');
    if (state !== savedState) throw new Error('State mismatch — possible CSRF attempt.');

    sessionStorage.removeItem('isle_pkce_verifier');
    sessionStorage.removeItem('isle_pkce_state');
    pendingRef.current = null;

    const { accessToken, refreshToken, user } = await exchangeCode(code, verifier);

    await saveRefreshToken(refreshToken);
    setSession(
      { id: user.id, email: user.email, displayName: user.displayName, timezone: user.timezone },
      accessToken,
    );
  }, [setSession]);

  return { startLogin, handleCallback };
}
