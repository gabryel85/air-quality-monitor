import { describe, expect, it } from 'vitest';

import { DEFAULT_SORT, isDefaultSort, resetSort, setSort, tableReducer } from './tableSlice';

describe('tableSlice', () => {
  it('initialises at the default sort', () => {
    expect(tableReducer(undefined, { type: '@@INIT' })).toEqual({ sort: DEFAULT_SORT });
  });

  it('setSort replaces the sort config', () => {
    const next = tableReducer(undefined, setSort({ column: 'maxNO2', direction: 'desc' }));
    expect(next.sort).toEqual({ column: 'maxNO2', direction: 'desc' });
  });

  it('resetSort returns to the default', () => {
    const sorted = tableReducer(undefined, setSort({ column: 'maxCO', direction: 'desc' }));
    expect(tableReducer(sorted, resetSort()).sort).toEqual(DEFAULT_SORT);
  });

  it('isDefaultSort distinguishes the default from a custom sort', () => {
    expect(isDefaultSort(DEFAULT_SORT)).toBe(true);
    expect(isDefaultSort({ column: 'maxCO', direction: 'desc' })).toBe(false);
    expect(isDefaultSort({ column: 'city', direction: 'desc' })).toBe(false);
  });
});
