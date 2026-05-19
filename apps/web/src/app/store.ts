import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { tableReducer } from '@/features/cities/tableSlice';
import { filtersReducer } from '@/features/filters/filtersSlice';
import { notesUiReducer } from '@/features/notes/notesUiSlice';

import { baseApi } from './api/baseApi';

/**
 * Listener middleware. Used in F-features to mirror URL ↔ Redux state.
 * No listeners registered at this stage; the middleware is wired in advance so
 * later features can `startListening(...)` without touching the store setup.
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
    getDefault({
      // RTK Query stores Date objects in `fulfilledTimeStamp`; we keep
      // serializableCheck on but ignore that key in the future.
    })
      .prepend(listenerMiddleware.middleware)
      .concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
