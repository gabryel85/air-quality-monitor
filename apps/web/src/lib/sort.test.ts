import { describe, expect, it } from 'vitest';

import { sortWithNullsLast } from './sort';

interface Row {
  readonly city: string;
  readonly value: number | null;
}

const data: readonly Row[] = [
  { city: 'Gdańsk', value: 18.67 },
  { city: 'Kraków', value: null },
  { city: 'Łódź', value: 22.0 },
  { city: 'Warszawa', value: 16.34 },
  { city: 'Żywiec', value: null },
];

describe('sortWithNullsLast', () => {
  it('sorts strings ascending with Polish-aware collation', () => {
    const r = sortWithNullsLast(data, (x) => x.city, 'asc');
    expect(r.map((x) => x.city)).toEqual(['Gdańsk', 'Kraków', 'Łódź', 'Warszawa', 'Żywiec']);
  });

  it('sorts strings descending', () => {
    const r = sortWithNullsLast(data, (x) => x.city, 'desc');
    expect(r.map((x) => x.city)).toEqual(['Żywiec', 'Warszawa', 'Łódź', 'Kraków', 'Gdańsk']);
  });

  it('puts nulls last regardless of direction (asc)', () => {
    const r = sortWithNullsLast(data, (x) => x.value, 'asc');
    expect(r.map((x) => x.value)).toEqual([16.34, 18.67, 22.0, null, null]);
  });

  it('puts nulls last regardless of direction (desc)', () => {
    const r = sortWithNullsLast(data, (x) => x.value, 'desc');
    expect(r.map((x) => x.value)).toEqual([22.0, 18.67, 16.34, null, null]);
  });

  it('returns a new array (does not mutate)', () => {
    const before = data.slice();
    sortWithNullsLast(data, (x) => x.city, 'asc');
    expect(data).toEqual(before);
  });

  it('handles all-null column without throwing', () => {
    const allNull: Row[] = [
      { city: 'A', value: null },
      { city: 'B', value: null },
    ];
    const r = sortWithNullsLast(allNull, (x) => x.value, 'asc');
    expect(r).toHaveLength(2);
  });

  it('handles empty input', () => {
    expect(sortWithNullsLast<Row>([], (x) => x.value, 'asc')).toEqual([]);
  });
});
