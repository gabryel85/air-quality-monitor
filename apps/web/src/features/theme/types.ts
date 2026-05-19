export type ThemePreference = 'light' | 'dark' | 'auto';
export type EffectiveTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';
export const THEME_VALUES: readonly ThemePreference[] = ['light', 'dark', 'auto'] as const;

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_VALUES as readonly string[]).includes(value);
}

export function resolveEffective(
  pref: ThemePreference,
  systemPrefersDark: boolean,
): EffectiveTheme {
  if (pref === 'auto') return systemPrefersDark ? 'dark' : 'light';
  return pref;
}
