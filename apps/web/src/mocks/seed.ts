/**
 * Seed data — synthetic but realistic.
 *
 * 13 European countries, 4-10 cities each, years 2022–2025. Measurement
 * values plausible for European air quality monitoring (PM10 0.1-2.0
 * µg/m³ in this scale; NO2 / CO scaled similarly). Year-to-year variation
 * is small but visible.
 */

import type { CityDto, CountryDto, NoteDto } from './types';

export const COUNTRIES: CountryDto[] = [
  { id: 'PL', name: 'Polska' },
  { id: 'DE', name: 'Deutschland' },
  { id: 'FR', name: 'France' },
  { id: 'IT', name: 'Italia' },
  { id: 'ES', name: 'España' },
  { id: 'GB', name: 'United Kingdom' },
  { id: 'CZ', name: 'Česko' },
  { id: 'SK', name: 'Slovensko' },
  { id: 'AT', name: 'Österreich' },
  { id: 'NL', name: 'Nederland' },
  { id: 'BE', name: 'België' },
  { id: 'SE', name: 'Sverige' },
  { id: 'NO', name: 'Norge' },
];

/**
 * Years are relative to "now" so the current year is always selectable
 * (it's the only one that polls live). Today's set: [now-3 … now].
 * Recomputed at module load — no hard-coded years to go stale.
 */
const CURRENT_YEAR = new Date().getFullYear();
const ALL_YEARS = [CURRENT_YEAR - 3, CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR];

export const YEARS_BY_COUNTRY: Record<string, number[]> = Object.fromEntries(
  COUNTRIES.map((c) => [c.id, [...ALL_YEARS]]),
);

export const CITIES_BY_COUNTRY: Record<string, CityDto[]> = {
  PL: [
    { cityId: 'gdansk', city: 'Gdańsk', countryId: 'PL' },
    { cityId: 'jaworzno', city: 'Jaworzno', countryId: 'PL' },
    { cityId: 'katowice', city: 'Katowice', countryId: 'PL' },
    { cityId: 'krakow', city: 'Kraków', countryId: 'PL' },
    { cityId: 'lodz', city: 'Łódź', countryId: 'PL' },
    { cityId: 'lublin', city: 'Lublin', countryId: 'PL' },
    { cityId: 'poznan', city: 'Poznań', countryId: 'PL' },
    { cityId: 'ruda-slaska', city: 'Ruda Śląska', countryId: 'PL' },
    { cityId: 'szczecin', city: 'Szczecin', countryId: 'PL' },
    { cityId: 'warszawa', city: 'Warszawa', countryId: 'PL' },
    { cityId: 'wroclaw', city: 'Wrocław', countryId: 'PL' },
  ],
  DE: [
    { cityId: 'berlin', city: 'Berlin', countryId: 'DE' },
    { cityId: 'bremen', city: 'Bremen', countryId: 'DE' },
    { cityId: 'dresden', city: 'Dresden', countryId: 'DE' },
    { cityId: 'frankfurt', city: 'Frankfurt am Main', countryId: 'DE' },
    { cityId: 'hamburg', city: 'Hamburg', countryId: 'DE' },
    { cityId: 'koeln', city: 'Köln', countryId: 'DE' },
    { cityId: 'leipzig', city: 'Leipzig', countryId: 'DE' },
    { cityId: 'muenchen', city: 'München', countryId: 'DE' },
    { cityId: 'nuernberg', city: 'Nürnberg', countryId: 'DE' },
    { cityId: 'stuttgart', city: 'Stuttgart', countryId: 'DE' },
  ],
  FR: [
    { cityId: 'paris', city: 'Paris', countryId: 'FR' },
    { cityId: 'lyon', city: 'Lyon', countryId: 'FR' },
    { cityId: 'marseille', city: 'Marseille', countryId: 'FR' },
    { cityId: 'toulouse', city: 'Toulouse', countryId: 'FR' },
    { cityId: 'bordeaux', city: 'Bordeaux', countryId: 'FR' },
    { cityId: 'nice', city: 'Nice', countryId: 'FR' },
    { cityId: 'nantes', city: 'Nantes', countryId: 'FR' },
    { cityId: 'strasbourg', city: 'Strasbourg', countryId: 'FR' },
  ],
  IT: [
    { cityId: 'roma', city: 'Roma', countryId: 'IT' },
    { cityId: 'milano', city: 'Milano', countryId: 'IT' },
    { cityId: 'napoli', city: 'Napoli', countryId: 'IT' },
    { cityId: 'torino', city: 'Torino', countryId: 'IT' },
    { cityId: 'palermo', city: 'Palermo', countryId: 'IT' },
    { cityId: 'genova', city: 'Genova', countryId: 'IT' },
    { cityId: 'bologna', city: 'Bologna', countryId: 'IT' },
    { cityId: 'firenze', city: 'Firenze', countryId: 'IT' },
  ],
  ES: [
    { cityId: 'madrid', city: 'Madrid', countryId: 'ES' },
    { cityId: 'barcelona', city: 'Barcelona', countryId: 'ES' },
    { cityId: 'valencia', city: 'Valencia', countryId: 'ES' },
    { cityId: 'sevilla', city: 'Sevilla', countryId: 'ES' },
    { cityId: 'zaragoza', city: 'Zaragoza', countryId: 'ES' },
    { cityId: 'malaga', city: 'Málaga', countryId: 'ES' },
    { cityId: 'bilbao', city: 'Bilbao', countryId: 'ES' },
  ],
  GB: [
    { cityId: 'london', city: 'London', countryId: 'GB' },
    { cityId: 'manchester', city: 'Manchester', countryId: 'GB' },
    { cityId: 'birmingham', city: 'Birmingham', countryId: 'GB' },
    { cityId: 'leeds', city: 'Leeds', countryId: 'GB' },
    { cityId: 'liverpool', city: 'Liverpool', countryId: 'GB' },
    { cityId: 'glasgow', city: 'Glasgow', countryId: 'GB' },
    { cityId: 'edinburgh', city: 'Edinburgh', countryId: 'GB' },
    { cityId: 'bristol', city: 'Bristol', countryId: 'GB' },
  ],
  CZ: [
    { cityId: 'praha', city: 'Praha', countryId: 'CZ' },
    { cityId: 'brno', city: 'Brno', countryId: 'CZ' },
    { cityId: 'ostrava', city: 'Ostrava', countryId: 'CZ' },
    { cityId: 'plzen', city: 'Plzeň', countryId: 'CZ' },
    { cityId: 'liberec', city: 'Liberec', countryId: 'CZ' },
    { cityId: 'olomouc', city: 'Olomouc', countryId: 'CZ' },
  ],
  SK: [
    { cityId: 'bratislava', city: 'Bratislava', countryId: 'SK' },
    { cityId: 'kosice', city: 'Košice', countryId: 'SK' },
    { cityId: 'presov', city: 'Prešov', countryId: 'SK' },
    { cityId: 'zilina', city: 'Žilina', countryId: 'SK' },
    { cityId: 'banska-bystrica', city: 'Banská Bystrica', countryId: 'SK' },
  ],
  AT: [
    { cityId: 'wien', city: 'Wien', countryId: 'AT' },
    { cityId: 'graz', city: 'Graz', countryId: 'AT' },
    { cityId: 'linz', city: 'Linz', countryId: 'AT' },
    { cityId: 'salzburg', city: 'Salzburg', countryId: 'AT' },
    { cityId: 'innsbruck', city: 'Innsbruck', countryId: 'AT' },
  ],
  NL: [
    { cityId: 'amsterdam', city: 'Amsterdam', countryId: 'NL' },
    { cityId: 'rotterdam', city: 'Rotterdam', countryId: 'NL' },
    { cityId: 'den-haag', city: 'Den Haag', countryId: 'NL' },
    { cityId: 'utrecht', city: 'Utrecht', countryId: 'NL' },
    { cityId: 'eindhoven', city: 'Eindhoven', countryId: 'NL' },
    { cityId: 'groningen', city: 'Groningen', countryId: 'NL' },
  ],
  BE: [
    { cityId: 'brussels', city: 'Brussel', countryId: 'BE' },
    { cityId: 'antwerpen', city: 'Antwerpen', countryId: 'BE' },
    { cityId: 'gent', city: 'Gent', countryId: 'BE' },
    { cityId: 'liege', city: 'Liège', countryId: 'BE' },
    { cityId: 'brugge', city: 'Brugge', countryId: 'BE' },
  ],
  SE: [
    { cityId: 'stockholm', city: 'Stockholm', countryId: 'SE' },
    { cityId: 'goteborg', city: 'Göteborg', countryId: 'SE' },
    { cityId: 'malmo', city: 'Malmö', countryId: 'SE' },
    { cityId: 'uppsala', city: 'Uppsala', countryId: 'SE' },
    { cityId: 'orebro', city: 'Örebro', countryId: 'SE' },
  ],
  NO: [
    { cityId: 'oslo', city: 'Oslo', countryId: 'NO' },
    { cityId: 'bergen', city: 'Bergen', countryId: 'NO' },
    { cityId: 'trondheim', city: 'Trondheim', countryId: 'NO' },
    { cityId: 'stavanger', city: 'Stavanger', countryId: 'NO' },
    { cityId: 'tromsoe', city: 'Tromsø', countryId: 'NO' },
  ],
};

/**
 * Deterministic per-city baseline. Year drift applied in getBaseValues.
 * Roughly: industrial cities in the south/east (Silesian PL, Italian
 * Po valley) get higher pollutants; Nordic + Alpine get cleaner values.
 */
const BASE_VALUES: Record<string, { no2: number; co: number; pm10: number }> = {
  // Poland
  gdansk: { no2: 18.67, co: 11.45, pm10: 0.29 },
  jaworzno: { no2: 41.56, co: 31.23, pm10: 1.28 },
  katowice: { no2: 39.84, co: 29.12, pm10: 1.21 },
  krakow: { no2: 22.31, co: 12.46, pm10: 0.3 },
  lodz: { no2: 26.45, co: 14.78, pm10: 0.43 },
  lublin: { no2: 20.89, co: 11.92, pm10: 0.28 },
  poznan: { no2: 26.78, co: 15.89, pm10: 0.48 },
  'ruda-slaska': { no2: 38.92, co: 28.54, pm10: 1.12 },
  szczecin: { no2: 17.23, co: 10.34, pm10: 0.26 },
  warszawa: { no2: 16.34, co: 9.87, pm10: 0.22 },
  wroclaw: { no2: 23.45, co: 13.21, pm10: 0.35 },

  // Germany
  berlin: { no2: 21.5, co: 12.1, pm10: 0.31 },
  bremen: { no2: 16.4, co: 9.2, pm10: 0.22 },
  dresden: { no2: 24.6, co: 14.5, pm10: 0.41 },
  frankfurt: { no2: 29.3, co: 17.8, pm10: 0.52 },
  hamburg: { no2: 14.2, co: 8.3, pm10: 0.18 },
  koeln: { no2: 27.8, co: 16.4, pm10: 0.42 },
  leipzig: { no2: 23.7, co: 13.8, pm10: 0.39 },
  muenchen: { no2: 25.3, co: 14.7, pm10: 0.36 },
  nuernberg: { no2: 22.4, co: 13.1, pm10: 0.34 },
  stuttgart: { no2: 32.1, co: 19.8, pm10: 0.58 },

  // France
  paris: { no2: 28.5, co: 17.2, pm10: 0.51 },
  lyon: { no2: 22.7, co: 13.4, pm10: 0.33 },
  marseille: { no2: 19.8, co: 11.5, pm10: 0.27 },
  toulouse: { no2: 17.9, co: 10.2, pm10: 0.21 },
  bordeaux: { no2: 15.6, co: 9.1, pm10: 0.18 },
  nice: { no2: 18.4, co: 10.8, pm10: 0.24 },
  nantes: { no2: 14.9, co: 8.7, pm10: 0.17 },
  strasbourg: { no2: 21.3, co: 12.5, pm10: 0.31 },

  // Italy
  roma: { no2: 32.4, co: 19.6, pm10: 0.62 },
  milano: { no2: 38.9, co: 24.1, pm10: 0.84 },
  napoli: { no2: 28.7, co: 17.4, pm10: 0.47 },
  torino: { no2: 33.5, co: 20.8, pm10: 0.71 },
  palermo: { no2: 21.4, co: 12.9, pm10: 0.29 },
  genova: { no2: 25.6, co: 15.3, pm10: 0.4 },
  bologna: { no2: 27.8, co: 16.7, pm10: 0.45 },
  firenze: { no2: 24.2, co: 14.3, pm10: 0.36 },

  // Spain
  madrid: { no2: 26.5, co: 15.4, pm10: 0.43 },
  barcelona: { no2: 28.7, co: 16.9, pm10: 0.48 },
  valencia: { no2: 20.1, co: 11.8, pm10: 0.28 },
  sevilla: { no2: 18.4, co: 10.7, pm10: 0.25 },
  zaragoza: { no2: 19.3, co: 11.2, pm10: 0.27 },
  malaga: { no2: 16.7, co: 9.8, pm10: 0.22 },
  bilbao: { no2: 22.5, co: 13.4, pm10: 0.34 },

  // United Kingdom
  london: { no2: 33.2, co: 20.1, pm10: 0.57 },
  manchester: { no2: 24.6, co: 14.4, pm10: 0.38 },
  birmingham: { no2: 26.9, co: 15.8, pm10: 0.43 },
  leeds: { no2: 22.1, co: 13.0, pm10: 0.33 },
  liverpool: { no2: 20.4, co: 12.0, pm10: 0.29 },
  glasgow: { no2: 19.7, co: 11.6, pm10: 0.28 },
  edinburgh: { no2: 14.3, co: 8.5, pm10: 0.18 },
  bristol: { no2: 17.8, co: 10.5, pm10: 0.23 },

  // Czechia
  praha: { no2: 25.4, co: 14.9, pm10: 0.39 },
  brno: { no2: 22.6, co: 13.4, pm10: 0.34 },
  ostrava: { no2: 34.8, co: 21.7, pm10: 0.78 },
  plzen: { no2: 20.7, co: 12.2, pm10: 0.3 },
  liberec: { no2: 17.5, co: 10.4, pm10: 0.24 },
  olomouc: { no2: 19.6, co: 11.6, pm10: 0.28 },

  // Slovakia
  bratislava: { no2: 23.8, co: 14.1, pm10: 0.36 },
  kosice: { no2: 27.4, co: 16.5, pm10: 0.46 },
  presov: { no2: 20.3, co: 12.0, pm10: 0.29 },
  zilina: { no2: 19.7, co: 11.7, pm10: 0.28 },
  'banska-bystrica': { no2: 17.2, co: 10.3, pm10: 0.23 },

  // Austria
  wien: { no2: 21.6, co: 12.7, pm10: 0.32 },
  graz: { no2: 26.4, co: 15.7, pm10: 0.42 },
  linz: { no2: 23.9, co: 14.2, pm10: 0.36 },
  salzburg: { no2: 16.8, co: 9.9, pm10: 0.22 },
  innsbruck: { no2: 14.1, co: 8.4, pm10: 0.17 },

  // Netherlands
  amsterdam: { no2: 22.4, co: 13.2, pm10: 0.33 },
  rotterdam: { no2: 26.1, co: 15.4, pm10: 0.41 },
  'den-haag': { no2: 20.7, co: 12.2, pm10: 0.3 },
  utrecht: { no2: 21.5, co: 12.7, pm10: 0.32 },
  eindhoven: { no2: 19.4, co: 11.5, pm10: 0.28 },
  groningen: { no2: 15.6, co: 9.2, pm10: 0.2 },

  // Belgium
  brussels: { no2: 27.3, co: 16.2, pm10: 0.44 },
  antwerpen: { no2: 28.9, co: 17.1, pm10: 0.47 },
  gent: { no2: 22.6, co: 13.4, pm10: 0.34 },
  liege: { no2: 24.1, co: 14.3, pm10: 0.37 },
  brugge: { no2: 17.4, co: 10.3, pm10: 0.23 },

  // Sweden
  stockholm: { no2: 14.7, co: 8.6, pm10: 0.19 },
  goteborg: { no2: 16.2, co: 9.5, pm10: 0.21 },
  malmo: { no2: 18.3, co: 10.8, pm10: 0.25 },
  uppsala: { no2: 12.4, co: 7.3, pm10: 0.15 },
  orebro: { no2: 13.6, co: 8.0, pm10: 0.17 },

  // Norway
  oslo: { no2: 15.3, co: 8.9, pm10: 0.2 },
  bergen: { no2: 12.1, co: 7.1, pm10: 0.15 },
  trondheim: { no2: 11.8, co: 6.9, pm10: 0.14 },
  stavanger: { no2: 13.5, co: 8.0, pm10: 0.17 },
  tromsoe: { no2: 9.4, co: 5.6, pm10: 0.11 },
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
  /** Year drift relative to the current year — EU regulations tighten
   *  over time, so older years skew slightly more polluted. Current
   *  year is the 1.0 baseline; clamped for stray past-year timestamps. */
  const yearsAgo = Math.min(Math.max(CURRENT_YEAR - year, 0), 6);
  const drift = 1 + yearsAgo * 0.035;
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
    {
      id: 5,
      cityId: 'milano',
      title: 'Po valley inversion event',
      content:
        'Anticyclone over Po valley trapped pollutants for 5 days; PM10 averaged 1.4 µg/m³ across all 6 stations. Reported to Regione Lombardia.',
      createdAt: daysAgo(5),
      updatedAt: daysAgo(4),
    },
    {
      id: 6,
      cityId: 'london',
      title: 'Ultra-Low Emission Zone impact',
      content:
        "ULEZ expansion data showing 18% YoY drop in NO2 along the boundary. Worth flagging to TfL's annual report.",
      createdAt: daysAgo(10),
      updatedAt: daysAgo(10),
    },
    {
      id: 7,
      cityId: 'praha',
      title: 'Holešovice industrial corridor',
      content:
        'Stations 11 + 14 showing concerning patterns near the chemical plant. Awaiting decision on enforcement action.',
      createdAt: daysAgo(20),
      updatedAt: daysAgo(15),
    },
    {
      id: 8,
      cityId: 'amsterdam',
      title: 'Cycling infrastructure correlation',
      content:
        'Cross-referenced bike-path expansion vs NO2 deltas. Strong negative correlation (-0.62) in central Amsterdam.',
      createdAt: daysAgo(30),
      updatedAt: daysAgo(30),
    },
  ];
}
