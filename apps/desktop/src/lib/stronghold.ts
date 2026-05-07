/**
 * stronghold.ts — Refresh token vault
 *
 * In a Tauri desktop build this wraps tauri-plugin-stronghold (Argon2-encrypted vault).
 * In a web/dev build it falls back to sessionStorage (cleared on tab close, never persisted).
 *
 * RULE: Refresh tokens NEVER go to localStorage. This module is the only
 * allowed storage point for a refresh token.
 */

const REFRESH_TOKEN_KEY = 'isle_rt';

// ─── Tauri detection ────────────────────────────────────────────────────────
function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

// ─── Tauri Stronghold implementation ────────────────────────────────────────
async function tauriSave(token: string): Promise<void> {
  const { Client, Stronghold } = await import('@tauri-apps/plugin-stronghold');
  const { appDataDir } = await import('@tauri-apps/api/path');
  const vaultPath = `${await appDataDir()}/isle.stronghold`;
  const stronghold = await Stronghold.load(vaultPath, await getMachinePassword());
  const client = await stronghold.loadClient('isle');
  const store = client.getStore();
  await store.insert(REFRESH_TOKEN_KEY, Array.from(new TextEncoder().encode(token)));
  await stronghold.save();
}

async function tauriLoad(): Promise<string | null> {
  try {
    const { Stronghold } = await import('@tauri-apps/plugin-stronghold');
    const { appDataDir } = await import('@tauri-apps/api/path');
    const vaultPath = `${await appDataDir()}/isle.stronghold`;
    const stronghold = await Stronghold.load(vaultPath, await getMachinePassword());
    const client = await stronghold.loadClient('isle');
    const store = client.getStore();
    const raw = await store.get(REFRESH_TOKEN_KEY);
    if (!raw) return null;
    return new TextDecoder().decode(new Uint8Array(raw));
  } catch {
    return null;
  }
}

async function tauriRemove(): Promise<void> {
  try {
    const { Stronghold } = await import('@tauri-apps/plugin-stronghold');
    const { appDataDir } = await import('@tauri-apps/api/path');
    const vaultPath = `${await appDataDir()}/isle.stronghold`;
    const stronghold = await Stronghold.load(vaultPath, await getMachinePassword());
    const client = await stronghold.loadClient('isle');
    const store = client.getStore();
    await store.remove(REFRESH_TOKEN_KEY);
    await stronghold.save();
  } catch { /* ignore */ }
}

/** Derive Stronghold password from machine ID (unique per device) */
async function getMachinePassword(): Promise<string> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<string>('get_machine_id');
  } catch {
    // Fallback — should not happen in production
    return 'isle-fallback-key';
  }
}

// ─── Web fallback (sessionStorage — cleared on tab close) ──────────────────
function webSave(token: string): void {
  sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
}

function webLoad(): string | null {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

function webRemove(): void {
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ─── Public API ──────────────────────────────────────────────────────────────
export async function saveRefreshToken(token: string): Promise<void> {
  if (isTauri()) {
    await tauriSave(token);
  } else {
    webSave(token);
  }
}

export async function loadRefreshToken(): Promise<string | null> {
  if (isTauri()) {
    return tauriLoad();
  }
  return webLoad();
}

export async function removeRefreshToken(): Promise<void> {
  if (isTauri()) {
    await tauriRemove();
  } else {
    webRemove();
  }
}
