/**
 * useFaultMode — reads and toggles the mock fault switch.
 *
 * Flipping it resets the RTK Query cache so every active query refetches
 * immediately, surfacing (or clearing) the simulated 503s without a reload.
 */

import { useCallback, useState } from 'react';

import { baseApi } from '@/app/api/baseApi';
import { useAppDispatch } from '@/app/hooks';
import { isFaultMode, setFaultMode } from '@/mocks/faultMode';

export interface UseFaultMode {
  readonly enabled: boolean;
  readonly setEnabled: (next: boolean) => void;
}

export function useFaultMode(): UseFaultMode {
  const dispatch = useAppDispatch();
  const [enabled, setEnabledState] = useState<boolean>(() => isFaultMode());

  const setEnabled = useCallback(
    (next: boolean) => {
      setFaultMode(next);
      setEnabledState(next);
      dispatch(baseApi.util.resetApiState());
    },
    [dispatch],
  );

  return { enabled, setEnabled };
}
