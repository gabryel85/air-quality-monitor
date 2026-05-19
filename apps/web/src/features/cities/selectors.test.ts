import { describe, expect, it } from 'vitest';

import type { CityStatsRow } from './citiesApi';
import { applyFilter, applySort, buildChartData } from './selectors';

const ROWS: readonly CityStatsRow[] = [
  { cityId: 'gdansk', city: 'Gdańsk', maxNO2: 18.67, maxCO: 11.45, maxPM10: 0.29 },
  { cityId: 'krakow', city: 'Kraków', maxNO2: null, maxCO: 12.46, maxPM10: 0.3 },
  { cityId: 'warszawa', city: 'Warszawa', maxNO2: 16.34, maxCO: 9.87, maxPM10: null },
];

describe('applyFilter — contains (default)', () => {
  it('returns all rows for empty query', () => {
    expect(applyFilter(ROWS, '')).toEqual(ROWS);
  });

  it('returns all rows for whitespace-only query', () => {
    expect(applyFilter(ROWS, '   ')).toEqual(ROWS);
  });

  it('matches substrings case-insensitively', () => {
    expect(applyFilter(ROWS, 'kRa').map((r) => r.cityId)).toEqual(['krakow']);
  });

  it('returns empty array on no match', () => {
    expect(applyFilter(ROWS, 'paris')).toEqual([]);
  });

  it('handles Polish diacritics', () => {
    expect(applyFilter(ROWS, 'gdań').map((r) => r.cityId)).toEqual(['gdansk']);
  });
});

describe('applyFilter — exact', () => {
  it('matches full city name case-insensitively', () => {
    expect(applyFilter(ROWS, 'gdańsk', 'exact').map((r) => r.cityId)).toEqual(['gdansk']);
  });

  it('rejects substring that is not the full name', () => {
    expect(applyFilter(ROWS, 'gdań', 'exact')).toEqual([]);
  });

  it('returns empty for no match', () => {
    expect(applyFilter(ROWS, 'paris', 'exact')).toEqual([]);
  });
});

describe('applyFilter — startsWith', () => {
  it('matches prefix case-insensitively', () => {
    expect(applyFilter(ROWS, 'War', 'startsWith').map((r) => r.cityId)).toEqual(['warszawa']);
  });

  it('rejects middle-of-string match', () => {
    expect(applyFilter(ROWS, 'kow', 'startsWith')).toEqual([]);
  });

  it('matches when query equals full name', () => {
    expect(applyFilter(ROWS, 'Kraków', 'startsWith').map((r) => r.cityId)).toEqual(['krakow']);
  });
});

describe('applySort', () => {
  it('sorts by city ascending (default)', () => {
    expect(applySort(ROWS, 'city', 'asc').map((r) => r.cityId)).toEqual([
      'gdansk',
      'krakow',
      'warszawa',
    ]);
  });

  it('sorts numeric column with nulls-last (asc)', () => {
    const r = applySort(ROWS, 'maxNO2', 'asc');
    expect(r.map((x) => x.cityId)).toEqual(['warszawa', 'gdansk', 'krakow']);
  });

  it('sorts numeric column with nulls-last (desc)', () => {
    const r = applySort(ROWS, 'maxNO2', 'desc');
    expect(r.map((x) => x.cityId)).toEqual(['gdansk', 'warszawa', 'krakow']);
  });

  it('handles all-null column', () => {
    const allNull: CityStatsRow[] = ROWS.map((r) => ({ ...r, maxPM10: null }));
    const r = applySort(allNull, 'maxPM10', 'asc');
    expect(r.map((x) => x.cityId)).toHaveLength(3);
  });

  it('does not mutate the input array', () => {
    const snapshot = ROWS.slice();
    applySort(ROWS, 'maxCO', 'desc');
    expect(ROWS).toEqual(snapshot);
  });
});

describe('buildChartData', () => {
  it('maps rows to chart bars (NO₂)', () => {
    expect(buildChartData(ROWS, 'maxNO2')).toEqual([
      { key: 'gdansk', label: 'Gdańsk', value: 18.67 },
      { key: 'krakow', label: 'Kraków', value: null },
      { key: 'warszawa', label: 'Warszawa', value: 16.34 },
    ]);
  });

  it('preserves null for sensor failure', () => {
    const r = buildChartData(ROWS, 'maxNO2');
    expect(r.find((b) => b.key === 'krakow')?.value).toBeNull();
  });

  it('preserves input row order (caller is responsible for sorting)', () => {
    const reversed = [...ROWS].reverse();
    expect(buildChartData(reversed, 'maxCO').map((b) => b.key)).toEqual([
      'warszawa',
      'krakow',
      'gdansk',
    ]);
  });
});
