import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './store';

/** Use throughout the app instead of plain `useDispatch` / `useSelector`. */
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
