/**
 * Filter / sort listener — fires after any filter or sort action,
 * serializes current state to a URL string, and pushes via UrlSyncProvider.
 *
 * Registration happens via `startFilterUrlListeners(listenerMiddleware)`
 * called from store.ts (single registration point per store).
 */

import { isAnyOf, type ListenerEffectAPI, type TypedStartListening } from '@reduxjs/toolkit';

import type { AppDispatch, RootState } from '@/app/store';
import { setSort } from '@/features/cities/tableSlice';
import { setAllFromUrl, setCountry, setMode, setQ, setYear } from '@/features/filters/filtersSlice';

import { serializeUrlState } from './urlState';
import { writeUrl } from './urlWriter';

export type AppStartListening = TypedStartListening<RootState, AppDispatch>;

/**
 * Wires up listeners that mirror state → URL whenever filter or sort
 * actions are dispatched. Idempotent — call once at store creation.
 */
export function startFilterUrlListeners(startListening: AppStartListening): void {
  startListening({
    matcher: isAnyOf(setCountry, setYear, setQ, setMode, setAllFromUrl, setSort),
    effect: (_action, api: ListenerEffectAPI<RootState, AppDispatch>) => {
      const state = api.getState();
      const search = serializeUrlState({
        country: state.filters.country,
        year: state.filters.year,
        q: state.filters.q,
        mode: state.filters.mode,
        sort: state.table.sort,
      });
      writeUrl(search);
    },
  });
}
