import { createContext, useContext } from 'react';

import type { EffectiveTheme, ThemePreference } from './types';

export interface ThemeContextValue {
  /** The user's stored preference (light / dark / auto). */
  readonly preference: ThemePreference;
  /** The currently active theme after resolving 'auto' against the OS preference. */
  readonly effective: EffectiveTheme;
  /** Update the preference and persist to localStorage. */
  readonly setPreference: (next: ThemePreference) => void;
  /** Cycle preference: light → dark → auto → light. */
  readonly cyclePreference: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}
