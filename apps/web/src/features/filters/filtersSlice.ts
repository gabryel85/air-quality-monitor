import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type FilterMode = 'contains' | 'exact' | 'startsWith';
export const FILTER_MODES: readonly FilterMode[] = ['contains', 'exact', 'startsWith'] as const;
export const DEFAULT_FILTER_MODE: FilterMode = 'contains';

export function isFilterMode(value: unknown): value is FilterMode {
  return typeof value === 'string' && (FILTER_MODES as readonly string[]).includes(value);
}

export interface FiltersState {
  /** ISO 3166-1 alpha-2 country code, or null when not selected */
  country: string | null;
  /** 4-digit year, or null when not selected */
  year: number | null;
  /** Free-text city filter; empty string means no filter */
  q: string;
  /** Matching strategy applied to `q`. */
  mode: FilterMode;
}

const initialState: FiltersState = {
  country: null,
  year: null,
  q: '',
  mode: DEFAULT_FILTER_MODE,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setCountry(state, action: PayloadAction<string | null>) {
      state.country = action.payload;
      // Changing country invalidates the year selection.
      if (action.payload === null) state.year = null;
    },
    setYear(state, action: PayloadAction<number | null>) {
      state.year = action.payload;
    },
    setQ(state, action: PayloadAction<string>) {
      state.q = action.payload;
    },
    setMode(state, action: PayloadAction<FilterMode>) {
      state.mode = action.payload;
    },
    setAllFromUrl(state, action: PayloadAction<Partial<FiltersState>>) {
      const { country, year, q, mode } = action.payload;
      if (country !== undefined) state.country = country;
      if (year !== undefined) state.year = year;
      if (q !== undefined) state.q = q;
      if (mode !== undefined) state.mode = mode;
    },
    reset() {
      return initialState;
    },
  },
});

export const {
  setCountry,
  setYear,
  setQ,
  setMode,
  setAllFromUrl,
  reset: resetFilters,
} = filtersSlice.actions;
export const filtersReducer = filtersSlice.reducer;
