import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { SearchInput } from '@/components/atoms/Input';
import { useDebouncedValue } from '@/lib/hooks';

import { setQ } from './filtersSlice';

export interface CityFilterInputProps {
  readonly className?: string;
}

const DEBOUNCE_MS = 300;

export function CityFilterInput({ className }: CityFilterInputProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const storeQ = useAppSelector((s) => s.filters.q);

  /* Remount the input whenever storeQ changes from outside (URL push, reset).
     This lets the inner component own its local typing buffer without
     `setState` in an effect — the React way to "reset state on prop change". */
  return (
    <CityFilterInputInner
      key={storeQ}
      initialValue={storeQ}
      onCommit={(next) => {
        if (next !== storeQ) dispatch(setQ(next));
      }}
      placeholder={`${t('labels.filter')}…`}
      ariaLabel={`${t('labels.filter')} ${t('labels.city').toLowerCase()}`}
      {...(className !== undefined ? { className } : {})}
    />
  );
}

interface InnerProps {
  readonly initialValue: string;
  readonly onCommit: (next: string) => void;
  readonly placeholder?: string;
  readonly ariaLabel?: string;
  readonly className?: string;
}

function CityFilterInputInner({
  initialValue,
  onCommit,
  placeholder,
  ariaLabel,
  className,
}: InnerProps) {
  const [localValue, setLocalValue] = useState<string>(initialValue);
  const debouncedValue = useDebouncedValue(localValue, DEBOUNCE_MS);

  /* Commit debounced value upstream. Stable ref guards against re-commit
     after onCommit caused the store to update (no-op feedback). */
  const lastCommittedRef = useRef<string>(initialValue);
  useEffect(() => {
    if (debouncedValue !== lastCommittedRef.current) {
      lastCommittedRef.current = debouncedValue;
      onCommit(debouncedValue);
    }
  }, [debouncedValue, onCommit]);

  return (
    <SearchInput
      value={localValue}
      onValueChange={setLocalValue}
      placeholder={placeholder}
      aria-label={ariaLabel}
      {...(className !== undefined ? { className } : {})}
    />
  );
}
