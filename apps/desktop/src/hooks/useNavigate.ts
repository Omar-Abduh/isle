import { useMemo } from 'react';
import { useLocation } from 'wouter';
import { useNavStore } from '../store/navStore';

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * Unified navigation hook: uses wouter for web (hash routing),
 * zustand navStore for Tauri (state-based). Always calls both
 * hooks to satisfy React's Rules of Hooks, but returns values
 * from the appropriate one based on environment.
 */
export function useAppNavigate(): { path: string; navigate: (to: string) => void } {
  const [webPath, webNavigate] = useLocation();
  const tauriPath = useNavStore((s) => s.path);
  const tauriNavigate = useNavStore((s) => s.navigate);

  return useMemo(() => {
    if (isTauri()) {
      return { path: tauriPath, navigate: tauriNavigate };
    }
    return { path: webPath, navigate: webNavigate };
  }, [webPath, webNavigate, tauriPath, tauriNavigate]);
}

/**
 * Module-level navigate for use outside React components (e.g. async callbacks).
 * Sets both the hash (web) and the zustand store (Tauri) so both environments work.
 */
export function navigate(to: string): void {
  if (isTauri()) {
    useNavStore.getState().navigate(to);
  } else {
    window.location.hash = to;
  }
}
