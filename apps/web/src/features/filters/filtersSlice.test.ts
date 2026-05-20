import { describe, expect, it } from 'vitest';

import {
  DEFAULT_FILTER_MODE,
  filtersReducer,
  isFilterMode,
  resetFilters,
  setAllFromUrl,
  setCountry,
  setMode,
  setQ,
  setYear,
} from './filtersSlice';

describe('filtersSlice', () => {
  const initial = filtersReducer(undefined, { type: '@@INIT' });

  it('starts empty', () => {
    expect(initial).toEqual({ country: null, year: null, q: '', mode: 'contains' });
  });

  it('setCountry sets the country', () => {
    expect(filtersReducer(initial, setCountry('PL')).country).toBe('PL');
  });

  it('clearing the country also clears the year', () => {
    const withSelection = filtersReducer(filtersReducer(initial, setCountry('PL')), setYear(2025));
    const cleared = filtersReducer(withSelection, setCountry(null));
    expect(cleared.country).toBeNull();
    expect(cleared.year).toBeNull();
  });

  it('setYear / setQ / setMode update their own field', () => {
    expect(filtersReducer(initial, setYear(2024)).year).toBe(2024);
    expect(filtersReducer(initial, setQ('warsz')).q).toBe('warsz');
    expect(filtersReducer(initial, setMode('exact')).mode).toBe('exact');
  });

  it('setAllFromUrl applies only the provided keys', () => {
    const next = filtersReducer(initial, setAllFromUrl({ country: 'DE', q: 'berlin' }));
    expect(next.country).toBe('DE');
    expect(next.q).toBe('berlin');
    expect(next.year).toBeNull();
    expect(next.mode).toBe(DEFAULT_FILTER_MODE);
  });

  it('reset returns to the initial state', () => {
    const dirty = filtersReducer(initial, setCountry('FR'));
    expect(filtersReducer(dirty, resetFilters())).toEqual(initial);
  });

  it('isFilterMode validates the mode string', () => {
    expect(isFilterMode('exact')).toBe(true);
    expect(isFilterMode('startsWith')).toBe(true);
    expect(isFilterMode('nope')).toBe(false);
    expect(isFilterMode(42)).toBe(false);
  });
});
