/**
 * Location detection for the onboarding wizard.
 *
 * Two independent signals, used in order: a key-less IP geolocation lookup
 * (most accurate, but a network call that can fail), then the browser's
 * timezone + locale (instant, offline, never fails). The wizard picks a
 * supported country from whichever resolves first.
 */

/** IANA timezone → supported country code. Covers the seed's 13 countries. */
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  'Europe/Warsaw': 'PL',
  'Europe/Berlin': 'DE',
  'Europe/Busingen': 'DE',
  'Europe/Paris': 'FR',
  'Europe/Rome': 'IT',
  'Europe/Madrid': 'ES',
  'Europe/London': 'GB',
  'Europe/Prague': 'CZ',
  'Europe/Bratislava': 'SK',
  'Europe/Vienna': 'AT',
  'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE',
  'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO',
};

/** Country code guessed from the browser's timezone, or null if unknown. */
export function detectFromTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_TO_COUNTRY[tz] ?? null;
  } catch {
    return null;
  }
}

/** Region subtag of the browser locale (`pl-PL` → `PL`), or null. */
export function detectFromLocale(): string | null {
  try {
    const region = navigator.language.split('-')[1];
    return region ? region.toUpperCase() : null;
  } catch {
    return null;
  }
}

export interface IpGeoResult {
  readonly countryId: string;
  readonly city: string | null;
}

/**
 * Looks up the visitor's country (and city) via ipwho.is — a free, key-less,
 * CORS-enabled service. Returns null on any failure so the caller can fall
 * back to the offline signals.
 */
export async function fetchIpGeo(signal: AbortSignal): Promise<IpGeoResult | null> {
  try {
    const res = await fetch('https://ipwho.is/', { signal });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (typeof data !== 'object' || data === null) return null;
    const record = data as Record<string, unknown>;
    if (record['success'] === false) return null;
    const code = record['country_code'];
    if (typeof code !== 'string' || code.length !== 2) return null;
    return {
      countryId: code.toUpperCase(),
      city: typeof record['city'] === 'string' ? record['city'] : null,
    };
  } catch {
    return null;
  }
}

/** Turns a country code into its flag emoji (`PL` → 🇵🇱). */
export function flagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .replace(/[A-Z]/g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}
