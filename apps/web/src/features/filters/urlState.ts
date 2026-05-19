/**
 * Serialize / parse the URL search params that mirror filtersSlice + tableSlice.
 *
 * Contract:
 *   - URL omits default + empty values (cleaner shareable URLs).
 *   - Params written in alphabetical order for deterministic comparison.
 *   - Invalid values silently dropped during parsing — never crash on a bad URL.
 *
 * Round-trip property: `parse(serialize(state)) ≈ state` for state where
 * inputs are valid; defaulted fields collapse to defaults.
 */

import type { SortableColumn, SortConfig } from '@/features/cities/tableSlice';
import { DEFAULT_SORT } from '@/features/cities/tableSlice';
import {
  DEFAULT_FILTER_MODE,
  isFilterMode,
  type FilterMode,
  type FiltersState,
} from './filtersSlice';

const VALID_SORTABLE: ReadonlySet<SortableColumn> = new Set(['city', 'maxNO2', 'maxCO', 'maxPM10']);

export interface UrlState extends FiltersState {
  readonly sort: SortConfig;
}

const PARAM = {
  country: 'country',
  year: 'year',
  q: 'q',
  mode: 'mode',
  sort: 'sort',
} as const;

// ============================================================
// Serialize: state → search-string
// ============================================================

export function serializeUrlState(state: UrlState): string {
  const params = new URLSearchParams();

  if (state.country) params.set(PARAM.country, state.country);
  if (state.year !== null) params.set(PARAM.year, String(state.year));
  if (state.q.length > 0) params.set(PARAM.q, state.q);
  if (state.mode !== DEFAULT_FILTER_MODE) {
    params.set(PARAM.mode, state.mode);
  }
  if (!isDefaultSort(state.sort)) {
    params.set(PARAM.sort, `${state.sort.column}:${state.sort.direction}`);
  }

  // Normalize order alphabetically — deterministic URL for same state.
  params.sort();
  const qs = params.toString();
  return qs.length > 0 ? `?${qs}` : '';
}

// ============================================================
// Parse: search-params → partial state (only what is valid)
// ============================================================

export function parseUrlState(searchParams: URLSearchParams): Partial<UrlState> {
  const out: {
    country?: string | null;
    year?: number | null;
    q?: string;
    mode?: FilterMode;
    sort?: SortConfig;
  } = {};

  const country = searchParams.get(PARAM.country);
  if (country !== null && /^[A-Z]{2}$/.test(country)) {
    out.country = country;
  }

  const yearRaw = searchParams.get(PARAM.year);
  if (yearRaw !== null) {
    const year = Number(yearRaw);
    if (Number.isInteger(year) && year >= 2000 && year <= 2100) {
      out.year = year;
    }
  }

  const q = searchParams.get(PARAM.q);
  if (q !== null) {
    out.q = q;
  }

  const modeRaw = searchParams.get(PARAM.mode);
  if (modeRaw !== null && isFilterMode(modeRaw)) {
    out.mode = modeRaw;
  }

  const sortRaw = searchParams.get(PARAM.sort);
  if (sortRaw !== null) {
    const sort = parseSortToken(sortRaw);
    if (sort) out.sort = sort;
  }

  return out;
}

// ============================================================
// Helpers
// ============================================================

function parseSortToken(raw: string): SortConfig | null {
  const parts = raw.split(':');
  if (parts.length !== 2) return null;
  const [col, dir] = parts;
  if (col === undefined || dir === undefined) return null;
  if (!VALID_SORTABLE.has(col as SortableColumn)) return null;
  if (dir !== 'asc' && dir !== 'desc') return null;
  return { column: col as SortableColumn, direction: dir };
}

function isDefaultSort(sort: SortConfig): boolean {
  return sort.column === DEFAULT_SORT.column && sort.direction === DEFAULT_SORT.direction;
}
