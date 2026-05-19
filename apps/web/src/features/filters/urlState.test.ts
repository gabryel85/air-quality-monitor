import { describe, expect, it } from 'vitest';

import { parseUrlState, serializeUrlState } from './urlState';

describe('serializeUrlState', () => {
  it('returns empty string for full-default state', () => {
    expect(
      serializeUrlState({
        country: null,
        year: null,
        q: '',
        sort: { column: 'city', direction: 'asc' },
      }),
    ).toBe('');
  });

  it('omits default sort from the URL', () => {
    expect(
      serializeUrlState({
        country: 'PL',
        year: 2025,
        q: '',
        sort: { column: 'city', direction: 'asc' },
      }),
    ).toBe('?country=PL&year=2025');
  });

  it('includes non-default sort', () => {
    expect(
      serializeUrlState({
        country: 'PL',
        year: 2025,
        q: '',
        sort: { column: 'maxNO2', direction: 'desc' },
      }),
    ).toBe('?country=PL&sort=maxNO2%3Adesc&year=2025');
  });

  it('includes city filter when non-empty', () => {
    expect(
      serializeUrlState({
        country: 'PL',
        year: 2025,
        q: 'warsz',
        sort: { column: 'city', direction: 'asc' },
      }),
    ).toBe('?country=PL&q=warsz&year=2025');
  });

  it('sorts params alphabetically for determinism', () => {
    const a = serializeUrlState({
      country: 'PL',
      year: 2025,
      q: 'a',
      sort: { column: 'maxCO', direction: 'desc' },
    });
    const b = serializeUrlState({
      year: 2025,
      country: 'PL',
      q: 'a',
      sort: { column: 'maxCO', direction: 'desc' },
    });
    expect(a).toBe(b);
  });
});

describe('parseUrlState', () => {
  it('parses a complete URL', () => {
    const params = new URLSearchParams('country=PL&year=2025&q=warsz&sort=maxNO2:desc');
    expect(parseUrlState(params)).toEqual({
      country: 'PL',
      year: 2025,
      q: 'warsz',
      sort: { column: 'maxNO2', direction: 'desc' },
    });
  });

  it('silently drops invalid country code', () => {
    const params = new URLSearchParams('country=polska');
    expect(parseUrlState(params)).toEqual({});
  });

  it('silently drops invalid year', () => {
    const params = new URLSearchParams('year=banana');
    expect(parseUrlState(params)).toEqual({});
  });

  it('silently drops invalid sort column', () => {
    const params = new URLSearchParams('sort=banana:asc');
    expect(parseUrlState(params)).toEqual({});
  });

  it('silently drops invalid sort direction', () => {
    const params = new URLSearchParams('sort=city:sideways');
    expect(parseUrlState(params)).toEqual({});
  });

  it('accepts empty q (signals "clear filter")', () => {
    const params = new URLSearchParams('q=');
    expect(parseUrlState(params)).toEqual({ q: '' });
  });
});

describe('round-trip: parse(serialize(x)) reflects x', () => {
  it('country+year+q+sort survive the round trip', () => {
    const initial = {
      country: 'PL',
      year: 2025,
      q: 'warsz',
      sort: { column: 'maxNO2' as const, direction: 'desc' as const },
    };
    const url = serializeUrlState(initial);
    const params = new URLSearchParams(url.startsWith('?') ? url.slice(1) : url);
    expect(parseUrlState(params)).toEqual(initial);
  });
});
