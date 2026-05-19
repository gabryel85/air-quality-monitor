import { configureStore, type TypedStartListening } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { createListenerMiddleware } from '@reduxjs/toolkit';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement, ReactNode } from 'react';

import { baseApi } from '@/app/api/baseApi';
import type { AppDispatch, RootState } from '@/app/store';
import { tableReducer } from '@/features/cities/tableSlice';
import { filtersReducer } from '@/features/filters/filtersSlice';
import { startFilterUrlListeners } from '@/features/filters/listeners';
import { UrlSyncProvider } from '@/features/filters/UrlSyncProvider';
import { notesUiReducer } from '@/features/notes/notesUiSlice';
import i18n from '@/i18n';

/**
 * Build a fresh store for each test so state doesn't leak between cases.
 * Mirrors the production store config exactly (same middleware, same listeners)
 * — tests exercise the real wiring, not a sanitized fake.
 */
export function makeTestStore() {
  const listenerMiddleware = createListenerMiddleware();
  const store = configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      filters: filtersReducer,
      table: tableReducer,
      notesUi: notesUiReducer,
    },
    middleware: (getDefault) =>
      getDefault().prepend(listenerMiddleware.middleware).concat(baseApi.middleware),
  });
  setupListeners(store.dispatch);
  startFilterUrlListeners(
    listenerMiddleware.startListening as TypedStartListening<RootState, AppDispatch>,
  );
  return store;
}

export interface RenderOptionsExtended extends Omit<RenderOptions, 'wrapper'> {
  readonly initialRoute?: string;
  readonly store?: ReturnType<typeof makeTestStore>;
}

interface RenderReturn extends RenderResult {
  readonly store: ReturnType<typeof makeTestStore>;
  readonly user: ReturnType<typeof userEvent.setup>;
}

/**
 * Renders a component with the full app provider stack:
 *   Provider (Redux store)
 *     └─ I18nextProvider (PL+EN ready)
 *           └─ MemoryRouter (no actual history pollution)
 *                 └─ children
 *
 * Returns the rendered output + the store (for state assertions) + a
 * configured userEvent instance (for typing/clicking with realistic timing).
 */
export function renderWithProviders(
  ui: ReactElement,
  { initialRoute = '/', store = makeTestStore(), ...rest }: RenderOptionsExtended = {},
): RenderReturn {
  function Wrapper({ children }: { readonly children: ReactNode }) {
    return (
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter initialEntries={[initialRoute]}>
            <UrlSyncProvider>{children}</UrlSyncProvider>
          </MemoryRouter>
        </I18nextProvider>
      </Provider>
    );
  }

  const user = userEvent.setup();
  const result = render(ui, { wrapper: Wrapper, ...rest });

  return { ...result, store, user };
}
