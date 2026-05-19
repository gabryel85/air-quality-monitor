import {
  configureStore,
  createListenerMiddleware,
  type TypedStartListening,
} from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { tableReducer } from '@/features/cities/tableSlice';
import { filtersReducer } from '@/features/filters/filtersSlice';
import { startFilterUrlListeners } from '@/features/filters/listeners';
import { notesUiReducer } from '@/features/notes/notesUiSlice';

import { baseApi } from './api/baseApi';

/**
 * Listener middleware. Wires state → URL sync for filters and sort.
 * Specific listeners registered below.
 */
export const listenerMiddleware = createListenerMiddleware();

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    filters: filtersReducer,
    table: tableReducer,
    notesUi: notesUiReducer,
  },
  middleware: (getDefault) =>
    getDefault().prepend(listenerMiddleware.middleware).concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Register typed listeners after store types are exported (avoids circular type ref).
const startListening = listenerMiddleware.startListening as TypedStartListening<
  RootState,
  AppDispatch
>;
startFilterUrlListeners(startListening);
