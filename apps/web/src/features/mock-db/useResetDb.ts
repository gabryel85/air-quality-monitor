/**
 * useResetDb — wipes the IndexedDB notes store and restores the sample notes.
 *
 * Shared by the header reset control and the notes storage-error recovery
 * panel. After the store is rebuilt, every cached `Notes` query is invalidated
 * so open lists refetch from the fresh database.
 */

import { useCallback, useEffect, useState } from 'react';

import { baseApi } from '@/app/api/baseApi';
import { useAppDispatch } from '@/app/hooks';
import { resetDb } from '@/mocks/notesDb';

export type ResetDbStatus = 'idle' | 'resetting' | 'done' | 'error';

export interface UseResetDb {
  readonly status: ResetDbStatus;
  /** Resolves `true` on success, `false` if the reset failed. */
  readonly reset: () => Promise<boolean>;
}

export function useResetDb(): UseResetDb {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<ResetDbStatus>('idle');

  const reset = useCallback(async (): Promise<boolean> => {
    setStatus('resetting');
    try {
      await resetDb();
      dispatch(baseApi.util.invalidateTags(['Notes']));
      setStatus('done');
      return true;
    } catch {
      setStatus('error');
      return false;
    }
  }, [dispatch]);

  // The success state is transient — revert to idle so a reopened control
  // shows its default affordance rather than a stale confirmation.
  useEffect(() => {
    if (status !== 'done') return;
    const id = setTimeout(() => setStatus('idle'), 2500);
    return () => {
      clearTimeout(id);
    };
  }, [status]);

  return { status, reset };
}
