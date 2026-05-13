import { useState, useEffect, useCallback } from 'react';

// ─── Preference Keys ────────────────────────────────────────────

const PREFS_KEY = 'isle_preferences';

export interface Preferences {
  islamicMessages: boolean;
}

const DEFAULTS: Preferences = {
  islamicMessages: true,
};

// ─── Hook ───────────────────────────────────────────────────────

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(() => {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, [prefs]);

  const update = useCallback((patch: Partial<Preferences>) => {
    setPrefs(prev => ({ ...prev, ...patch }));
  }, []);

  return { prefs, update };
}
