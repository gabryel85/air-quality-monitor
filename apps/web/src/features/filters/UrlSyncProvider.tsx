/**
 * UrlSyncProvider — single source of truth for filter state.
 *
 * Bidirectional sync URL <-> Redux:
 *
 *   URL changes (back/forward, manual edit, deep-link)
 *     → useSearchParams() picks it up
 *     → dispatch(setAllFromUrl(...))   (filtersSlice + tableSlice)
 *
 *   Redux changes (user picks country, sorts column, types in filter)
 *     → this provider serializes the state
 *     → navigates to the new search string (replace, not push)
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setSort } from '@/features/cities/tableSlice';
import { setAllFromUrl } from '@/features/filters/filtersSlice';

import { parseUrlState, serializeUrlState } from './urlState';

export function UrlSyncProvider({ children }: { readonly children: ReactNode }) {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useAppSelector((s) => s.filters);
  const sort = useAppSelector((s) => s.table.sort);

  // Track what we wrote ourselves so URL→state doesn't loop.
  const lastWrittenRef = useRef<string>('');
  const [hasReadInitialUrl, setHasReadInitialUrl] = useState(false);

  // URL → Redux: parse and apply any changes that don't match the store.
  useEffect(() => {
    const currentSearch = `?${searchParams.toString()}`;
    if (currentSearch === lastWrittenRef.current) return;

    const parsed = parseUrlState(searchParams);

    // Filters slice update
    const filterPatch: Parameters<typeof setAllFromUrl>[0] = {};
    if (parsed.country !== undefined) filterPatch.country = parsed.country;
    if (parsed.year !== undefined) filterPatch.year = parsed.year;
    if (parsed.q !== undefined) filterPatch.q = parsed.q;
    if (parsed.mode !== undefined) filterPatch.mode = parsed.mode;
    if (Object.keys(filterPatch).length > 0) {
      dispatch(setAllFromUrl(filterPatch));
    }

    // Sort slice update
    if (parsed.sort !== undefined) {
      dispatch(setSort(parsed.sort));
    }
    setHasReadInitialUrl(true);
    // Note: we don't reset to defaults when params are absent — that would
    // wipe state during navigation. Defaults appear when URL is empty
    // because parseUrlState returns no keys, leaving Redux alone (already
    // at default for fresh mount).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Redux → URL: write only after the initial URL has had a chance to hydrate Redux.
  // Diff against the current URL to avoid no-op writes.
  useEffect(() => {
    if (!hasReadInitialUrl) return;
    const desired = serializeUrlState({ ...filters, sort });
    const current = `?${searchParams.toString()}`;
    const normalizedCurrent = current === '?' ? '' : current;
    if (desired !== normalizedCurrent) {
      lastWrittenRef.current = desired;
      const next = new URLSearchParams(desired.startsWith('?') ? desired.slice(1) : desired);
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort, hasReadInitialUrl]);

  return <>{children}</>;
}
