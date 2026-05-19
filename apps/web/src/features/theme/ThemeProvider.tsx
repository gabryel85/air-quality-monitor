import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  isThemePreference,
  resolveEffective,
  THEME_STORAGE_KEY,
  type EffectiveTheme,
  type ThemePreference,
} from './types';
import { ThemeContext, type ThemeContextValue } from './useTheme';

function readInitialPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemePreference(stored)) return stored;
  } catch {
    /* localStorage blocked — fall through to default */
  }
  return 'auto';
}

function readSystemDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(pref: ThemePreference, effective: EffectiveTheme): void {
  const html = document.documentElement;
  html.dataset['theme'] = pref;
  html.classList.toggle('dark', effective === 'dark');
}

export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readInitialPreference);
  const [systemDark, setSystemDark] = useState<boolean>(readSystemDark);

  // Sync state → DOM (covers cases where state changes after mount).
  useEffect(() => {
    applyTheme(preference, resolveEffective(preference, systemDark));
  }, [preference, systemDark]);

  // Watch system preference; only triggers visual change when preference is 'auto'.
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemDark(e.matches);
    };
    mql.addEventListener('change', handler);
    return () => {
      mql.removeEventListener('change', handler);
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* localStorage blocked — preference still applied for session */
    }
    setPreferenceState(next);
  }, []);

  const cyclePreference = useCallback(() => {
    setPreferenceState((curr) => {
      const next: ThemePreference = curr === 'light' ? 'dark' : curr === 'dark' ? 'auto' : 'light';
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* ignored */
      }
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      effective: resolveEffective(preference, systemDark),
      setPreference,
      cyclePreference,
    }),
    [preference, systemDark, setPreference, cyclePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
