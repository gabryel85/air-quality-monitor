/**
 * Format a timestamp as a relative time string in the current locale,
 * using the native Intl.RelativeTimeFormat (no library needed).
 */

const UNITS: ReadonlyArray<readonly [Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 24 * 60 * 60_000],
  ['month', 30 * 24 * 60 * 60_000],
  ['day', 24 * 60 * 60_000],
  ['hour', 60 * 60_000],
  ['minute', 60_000],
  ['second', 1_000],
];

export function formatRelativeTime(
  timestamp: number,
  locale: string = 'en',
  now: number = Date.now(),
): string {
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });
  const diff = timestamp - now; // negative for past

  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms || unit === 'second') {
      return formatter.format(Math.round(diff / ms), unit);
    }
  }

  return formatter.format(0, 'second');
}
