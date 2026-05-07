/**
 * tauriStoreAdapter.ts — Zustand persist storage adapter
 *
 * Uses Tauri Store plugin on desktop, falls back to localStorage on web.
 * Never used for secrets — only for offline queue and user preferences.
 */
import { StateStorage } from 'zustand/middleware';

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

// Lazily-loaded Tauri store instance
let _tauriStore: Awaited<ReturnType<typeof import('@tauri-apps/plugin-store')['load']>> | null = null;

async function getTauriStore() {
  if (!_tauriStore) {
    const { load } = await import('@tauri-apps/plugin-store');
    _tauriStore = await load('isle-store.json', { autoSave: true, defaults: {} });
  }
  return _tauriStore;
}

export const tauriStoreAdapter: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (!isTauri()) return localStorage.getItem(name);
    try {
      const store = await getTauriStore();
      const value = await store.get<string>(name);
      return value ?? null;
    } catch {
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    if (!isTauri()) { localStorage.setItem(name, value); return; }
    try {
      const store = await getTauriStore();
      await store.set(name, value);
    } catch { /* ignore write errors */ }
  },

  removeItem: async (name: string): Promise<void> => {
    if (!isTauri()) { localStorage.removeItem(name); return; }
    try {
      const store = await getTauriStore();
      await store.delete(name);
    } catch { /* ignore */ }
  },
};
