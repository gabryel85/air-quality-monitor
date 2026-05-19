/**
 * Reselect chain — derived state for the dashboard.
 *
 * The fundamental contract:
 *   raw cities (from RTK Query cache, keyed by current country+year)
 *     → filter by city name (q)
 *     → sort by current sort config (nulls-last)
 *     → fan out to: table data, chart data, count, last-updated label
 *
 * Reselect memoizes by REFERENCE equality of inputs, so polling that
 * returns identical data results in zero re-renders of the chart/table.
 */

import { createSelector } from '@reduxjs/toolkit';
import { QueryStatus } from '@reduxjs/toolkit/query';

import type { RootState } from '@/app/store';
import { sortWithNullsLast, type SortDirection } from '@/lib/sort';

import type { FilterMode } from '@/features/filters/filtersSlice';

import { citiesApi, type CityStatsRow } from './citiesApi';
import type { SortableColumn } from './tableSlice';

// ============================================================
// Input selectors (cheap reads)
// ============================================================

export const selectFiltersState = (state: RootState) => state.filters;
export const selectSortConfig = (state: RootState) => state.table.sort;

/**
 * Read the cities-stats query result for the current filter combination.
 * If country or year is missing, returns an empty-cache shape so downstream
 * selectors stay typed and memoised against a stable reference.
 *
 * Returns the raw RTK Query CACHE slot — keys: data, status, error,
 * fulfilledTimeStamp. (isLoading/isFetching/isSuccess/isError live on the
 * hook layer, not the cache; we derive them in the selectors below.)
 */
export const selectCitiesQueryResult = (state: RootState) => {
  const { country, year } = state.filters;
  if (!country || year === null) {
    return EMPTY_RESULT;
  }
  return citiesApi.endpoints.getCitiesStats.select({
    countryId: country,
    year,
  })(state);
};

const EMPTY_RESULT = {
  data: undefined as readonly CityStatsRow[] | undefined,
  status: QueryStatus.uninitialized,
  error: undefined,
  fulfilledTimeStamp: undefined as number | undefined,
};

// ============================================================
// Pure derivers (exported for unit tests)
// ============================================================

export function applyFilter(
  rows: readonly CityStatsRow[],
  q: string,
  mode: FilterMode = 'contains',
): readonly CityStatsRow[] {
  const needle = q.trim().toLowerCase();
  if (needle.length === 0) return rows;
  return rows.filter((c) => {
    const haystack = c.city.toLowerCase();
    if (mode === 'exact') return haystack === needle;
    if (mode === 'startsWith') return haystack.startsWith(needle);
    return haystack.includes(needle);
  });
}

export function applySort(
  rows: readonly CityStatsRow[],
  column: SortableColumn,
  direction: SortDirection,
): readonly CityStatsRow[] {
  return sortWithNullsLast(rows, (r) => r[column], direction);
}

// ============================================================
// Composed selectors
// ============================================================

export const selectRawCities = createSelector(
  [selectCitiesQueryResult],
  (q): readonly CityStatsRow[] => q.data ?? [],
);

export const selectFilteredCities = createSelector(
  [selectRawCities, selectFiltersState],
  (rows, filters) => applyFilter(rows, filters.q, filters.mode),
);

export const selectSortedCities = createSelector(
  [selectFilteredCities, selectSortConfig],
  (rows, sort) => applySort(rows, sort.column, sort.direction),
);

export const selectVisibleCityCount = createSelector([selectFilteredCities], (rows) => rows.length);

export const selectLastUpdatedAt = createSelector(
  [selectCitiesQueryResult],
  (q): number | null => q.fulfilledTimeStamp ?? null,
);

// ============================================================
// Chart data — fan-out
// ============================================================

export type ChartMetric = 'maxNO2' | 'maxCO' | 'maxPM10';

export interface ChartBarDatum {
  readonly key: string;
  readonly label: string;
  readonly value: number | null;
}

export function buildChartData(
  rows: readonly CityStatsRow[],
  metric: ChartMetric,
): ChartBarDatum[] {
  return rows.map((r) => ({
    key: r.cityId,
    label: r.city,
    value: r[metric],
  }));
}

export function makeSelectChartData(metric: ChartMetric) {
  return createSelector([selectSortedCities], (rows) => buildChartData(rows, metric));
}

// Common cached instance for the default chart (NO₂ — the spec's main metric).
export const selectNO2ChartData = makeSelectChartData('maxNO2');

// ============================================================
// Loading / error mirror — single source for the UI to consult
// ============================================================

/** True only for the FIRST fetch (no data yet) — use to gate skeletons. */
export const selectCitiesLoading = createSelector(
  [selectCitiesQueryResult],
  (q) => q.status === QueryStatus.pending && q.data === undefined,
);

/** True for any in-flight fetch (polling included). Use for subtle indicators. */
export const selectCitiesFetching = createSelector(
  [selectCitiesQueryResult],
  (q) => q.status === QueryStatus.pending,
);

export const selectCitiesError = createSelector([selectCitiesQueryResult], (q) =>
  q.status === QueryStatus.rejected ? q.error : undefined,
);
