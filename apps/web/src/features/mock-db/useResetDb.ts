/**
 * useResetDb — wipes the IndexedDB notes store and restores the sample notes.
 *
 * Shared by the header reset control and the notes storage-error recovery
 * panel. After the store is rebuilt, every cached `Notes` query is invalidated
 * so open lists refetch from the fresh database.
 */

import { useCallback, useState } from 'react';

import { baseApi } from '@/app/api/baseApi';
import { useAppDispatch } from '@/app/hooks';
import { resetDb } from '@/mocks/notesDb';

export type ResetDbStatus = 'idle' | 'resetting' | 'done' | 'error';

export interface UseResetDb {
  readonly status: ResetDbStatus;
  readonly reset: () => Promise<void>;
}

export function useResetDb(): UseResetDb {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<ResetDbStatus>('idle');

  const reset = useCallback(async () => {
    setStatus('resetting');
    try {
      await resetDb();
      dispatch(baseApi.util.invalidateTags(['Notes']));
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }, [dispatch]);

  return { status, reset };
}
