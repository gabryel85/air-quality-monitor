import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { tableReducer } from '@/features/cities/tableSlice';
import { filtersReducer } from '@/features/filters/filtersSlice';

import { baseApi } from './api/baseApi';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    filters: filtersReducer,
    table: tableReducer,
  },
  middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
