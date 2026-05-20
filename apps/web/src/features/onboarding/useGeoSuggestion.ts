/**
 * useGeoSuggestion — resolves a starting country (and maybe city) for the
 * onboarding wizard.
 *
 * Strategy: try the IP lookup with a short timeout; on failure or an
 * unsupported country, fall back to timezone + locale; if even that misses,
 * use a sensible default. The result always points at a country we have
 * data for, so the wizard can pre-fill immediately.
 */

import { useEffect, useState } from 'react';

import { CITIES_BY_COUNTRY, COUNTRIES } from '@/mocks/seed';

import { detectFromLocale, detectFromTimezone, fetchIpGeo } from './geo';

export type GeoSource = 'ip' | 'timezone' | 'default';

export interface GeoSuggestion {
  readonly loading: boolean;
  /** Always a supported country id — usable for an immediate pre-fill. */
  readonly countryId: string;
  readonly source: GeoSource;
  /** City id detected from IP, when it matches a city in the dataset. */
  readonly cityId: string | null;
}

const SUPPORTED = new Set(COUNTRIES.map((c) => c.id));
const DEFAULT_COUNTRY = 'PL';
const IP_TIMEOUT_MS = 2500;

function normalize(value: string): string {
  // Strip combining diacritical marks so "Kraków" matches "Krakow".
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** Resolves an IP-reported city name to a known cityId, or null. */
function matchCity(countryId: string, cityName: string | null): string | null {
  if (!cityName) return null;
  const target = normalize(cityName);
  const found = (CITIES_BY_COUNTRY[countryId] ?? []).find(
    (c) => normalize(c.city) === target || c.cityId === target,
  );
  return found?.cityId ?? null;
}

function offlineFallback(): GeoSuggestion {
  const candidate = [detectFromTimezone(), detectFromLocale()].find(
    (code): code is string => code !== null && SUPPORTED.has(code),
  );
  return {
    loading: false,
    countryId: candidate ?? DEFAULT_COUNTRY,
    source: candidate ? 'timezone' : 'default',
    cityId: null,
  };
}

const isTestEnv = import.meta.env.MODE === 'test';

export function useGeoSuggestion(): GeoSuggestion {
  // Tests run offline: seed the offline fallback as the initial value so the
  // effect never has to touch the network (or call setState synchronously).
  const [state, setState] = useState<GeoSuggestion>(() =>
    isTestEnv
      ? offlineFallback()
      : { loading: true, countryId: DEFAULT_COUNTRY, source: 'default', cityId: null },
  );

  useEffect(() => {
    if (isTestEnv) return;

    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, IP_TIMEOUT_MS);

    void fetchIpGeo(controller.signal).then((ip) => {
      if (cancelled) return;
      clearTimeout(timer);
      if (ip && SUPPORTED.has(ip.countryId)) {
        setState({
          loading: false,
          countryId: ip.countryId,
          source: 'ip',
          cityId: matchCity(ip.countryId, ip.city),
        });
      } else {
        setState(offlineFallback());
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  return state;
}
