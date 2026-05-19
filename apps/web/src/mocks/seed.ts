/**
 * Seed data — synthetic but realistic.
 *
 * Cities chosen to be recognizable. Measurement values plausible for European
 * air quality monitoring (PM10 typically 0.1-2.0 µg/m³ in this scale; NO2 and
 * CO scaled similarly). Year-to-year variation is small but visible.
 */

import type { CityDto, CountryDto, NoteDto } from './types';

export const COUNTRIES: CountryDto[] = [
  { id: 'PL', name: 'Polska' },
  { id: 'DE', name: 'Deutschland' },
  { id: 'FR', name: 'France' },
];

export const YEARS_BY_COUNTRY: Record<string, number[]> = {
  PL: [2023, 2024, 2025],
  DE: [2023, 2024, 2025],
  FR: [2024, 2025],
};

export const CITIES_BY_COUNTRY: Record<string, CityDto[]> = {
  PL: [
    { cityId: 'gdansk', city: 'Gdańsk', countryId: 'PL' },
    { cityId: 'jaworzno', city: 'Jaworzno', countryId: 'PL' },
    { cityId: 'krakow', city: 'Kraków', countryId: 'PL' },
    { cityId: 'poznan', city: 'Poznań', countryId: 'PL' },
    { cityId: 'ruda-slaska', city: 'Ruda Śląska', countryId: 'PL' },
    { cityId: 'warszawa', city: 'Warszawa', countryId: 'PL' },
    { cityId: 'wroclaw', city: 'Wrocław', countryId: 'PL' },
  ],
  DE: [
    { cityId: 'berlin', city: 'Berlin', countryId: 'DE' },
    { cityId: 'hamburg', city: 'Hamburg', countryId: 'DE' },
    { cityId: 'koeln', city: 'Köln', countryId: 'DE' },
    { cityId: 'muenchen', city: 'München', countryId: 'DE' },
    { cityId: 'stuttgart', city: 'Stuttgart', countryId: 'DE' },
  ],
  FR: [
    { cityId: 'paris', city: 'Paris', countryId: 'FR' },
    { cityId: 'lyon', city: 'Lyon', countryId: 'FR' },
    { cityId: 'marseille', city: 'Marseille', countryId: 'FR' },
    { cityId: 'toulouse', city: 'Toulouse', countryId: 'FR' },
  ],
};

/** Deterministic per-city measurement values. Year scales them slightly. */
const BASE_VALUES: Record<string, { no2: number; co: number; pm10: number }> = {
  gdansk: { no2: 18.67, co: 11.45, pm10: 0.29 },
  jaworzno: { no2: 41.56, co: 31.23, pm10: 1.28 },
  krakow: { no2: 22.31, co: 12.46, pm10: 0.3 },
  poznan: { no2: 26.78, co: 15.89, pm10: 0.48 },
  'ruda-slaska': { no2: 38.92, co: 28.54, pm10: 1.12 },
  warszawa: { no2: 16.34, co: 9.87, pm10: 0.22 },
  wroclaw: { no2: 23.45, co: 13.21, pm10: 0.35 },
  berlin: { no2: 21.5, co: 12.1, pm10: 0.31 },
  hamburg: { no2: 14.2, co: 8.3, pm10: 0.18 },
  koeln: { no2: 27.8, co: 16.4, pm10: 0.42 },
  muenchen: { no2: 25.3, co: 14.7, pm10: 0.36 },
  stuttgart: { no2: 32.1, co: 19.8, pm10: 0.58 },
  paris: { no2: 28.5, co: 17.2, pm10: 0.51 },
  lyon: { no2: 22.7, co: 13.4, pm10: 0.33 },
  marseille: { no2: 19.8, co: 11.5, pm10: 0.27 },
  toulouse: { no2: 17.9, co: 10.2, pm10: 0.21 },
};

export function getBaseValues(
  cityId: string,
  year: number,
): {
  no2: number;
  co: number;
  pm10: number;
} {
  const base = BASE_VALUES[cityId];
  if (!base) return { no2: 0, co: 0, pm10: 0 };
  // Year drift: 2023 = -5%, 2024 = 0%, 2025 = +3%
  const drift = year === 2023 ? 0.95 : year === 2025 ? 1.03 : 1;
  return {
    no2: round2(base.no2 * drift),
    co: round2(base.co * drift),
    pm10: round2(base.pm10 * drift),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** In-memory notes store. Mutates with POST/PATCH; resets on page reload. */
export function initialNotes(): NoteDto[] {
  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString();
  return [
    {
      id: 1,
      cityId: 'krakow',
      title: 'Smog episode confirmed',
      content:
        'Cross-referenced with WIOŚ data: PM10 spike on Feb 12 correlates with low wind and inversion layer. No traffic incident.',
      createdAt: daysAgo(3),
      updatedAt: daysAgo(2),
    },
    {
      id: 2,
      cityId: 'krakow',
      title: 'Sensor station 04 — drift suspected',
      content:
        'NO2 readings consistently 15-20% above neighbouring stations. Scheduled for calibration check next week.',
      createdAt: daysAgo(7),
      updatedAt: daysAgo(7),
    },
    {
      id: 3,
      cityId: 'warszawa',
      title: 'New monitoring station online',
      content: 'Ursynów station active since 2024-Q4. Feeding into the network as of this week.',
      createdAt: daysAgo(14),
      updatedAt: daysAgo(14),
    },
    {
      id: 4,
      cityId: 'berlin',
      title: 'Berlin S-Bahn corridor analysis',
      content: 'NO2 elevated along Stadtbahn route. Preparing report for transport authority.',
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
  ];
}
