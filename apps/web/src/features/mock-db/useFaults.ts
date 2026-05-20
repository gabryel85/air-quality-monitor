/**
 * useFaults — reads and toggles the per-endpoint mock fault switches.
 *
 * Subscribes to the faultMode external store so every consumer (header
 * popover, mobile menu) stays in sync. Any change resets the RTK Query cache
 * so active queries refetch immediately, surfacing or clearing the 503s.
 */

import { useCallback, useSyncExternalStore } from 'react';

import { baseApi } from '@/app/api/baseApi';
import { useAppDispatch } from '@/app/hooks';
import {
  FAULT_TARGETS,
  getFaults,
  setAllFaults,
  setFault as setFaultInStore,
  subscribeFaults,
  type FaultTarget,
} from '@/mocks/faultMode';

export interface UseFaults {
  readonly faults: ReadonlySet<FaultTarget>;
  readonly anyEnabled: boolean;
  readonly allEnabled: boolean;
  readonly setFault: (target: FaultTarget, on: boolean) => void;
  readonly setAll: (on: boolean) => void;
}

export function useFaults(): UseFaults {
  const dispatch = useAppDispatch();
  const faults = useSyncExternalStore(subscribeFaults, getFaults, getFaults);

  const setFault = useCallback(
    (target: FaultTarget, on: boolean) => {
      setFaultInStore(target, on);
      dispatch(baseApi.util.resetApiState());
    },
    [dispatch],
  );

  const setAll = useCallback(
    (on: boolean) => {
      setAllFaults(on);
      dispatch(baseApi.util.resetApiState());
    },
    [dispatch],
  );

  return {
    faults,
    anyEnabled: faults.size > 0,
    allEnabled: faults.size === FAULT_TARGETS.length,
    setFault,
    setAll,
  };
}
