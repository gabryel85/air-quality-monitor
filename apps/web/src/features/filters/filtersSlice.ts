import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface FiltersState {
  /** ISO 3166-1 alpha-2 country code, or null when not selected */
  country: string | null;
  /** 4-digit year, or null when not selected */
  year: number | null;
  /** Free-text city filter; empty string means no filter */
  q: string;
}

const initialState: FiltersState = {
  country: null,
  year: null,
  q: '',
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
    setAllFromUrl(state, action: PayloadAction<Partial<FiltersState>>) {
      const { country, year, q } = action.payload;
      if (country !== undefined) state.country = country;
      if (year !== undefined) state.year = year;
      if (q !== undefined) state.q = q;
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
  setAllFromUrl,
  reset: resetFilters,
} = filtersSlice.actions;
export const filtersReducer = filtersSlice.reducer;
