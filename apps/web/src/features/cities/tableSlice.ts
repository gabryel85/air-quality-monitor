import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type SortableColumn = 'city' | 'maxNO2' | 'maxCO' | 'maxPM10';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  column: SortableColumn;
  direction: SortDirection;
}

export interface TableState {
  sort: SortConfig;
}

export const DEFAULT_SORT: SortConfig = { column: 'city', direction: 'asc' };

const initialState: TableState = { sort: DEFAULT_SORT };

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setSort(state, action: PayloadAction<SortConfig>) {
      state.sort = action.payload;
    },
    resetSort(state) {
      state.sort = DEFAULT_SORT;
    },
  },
});

export const { setSort, resetSort } = tableSlice.actions;
export const tableReducer = tableSlice.reducer;

export function isDefaultSort(sort: SortConfig): boolean {
  return sort.column === DEFAULT_SORT.column && sort.direction === DEFAULT_SORT.direction;
}
