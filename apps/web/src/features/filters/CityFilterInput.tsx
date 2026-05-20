/**
 * CityFilterInput — feature.
 *
 * Search-style input with two inline action buttons:
 *   - left: mode-cycle button (contains → exact → startsWith), icon-only.
 *   - right: clear-X button when the field has content.
 *
 * Typing buffer:
 *   The input keeps a LOCAL value so keystrokes never wait on Redux. After
 *   the user pauses (DEBOUNCE_MS), the value is committed to the store.
 *
 *   External store changes (URL paste, reset) are adopted into the local
 *   value via the React "adjust state during render" pattern — NOT a key
 *   remount. A remount would unmount the <input>, drop focus, and stop the
 *   user mid-word. The whole component stays mounted; only `value` updates.
 */

import { Asterisk, ChevronsRight, Equal, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useDebouncedValue } from '@/lib/hooks';
import { cn } from '@/lib/utils';

import { FILTER_MODES, setMode, setQ, type FilterMode } from './filtersSlice';

export interface CityFilterInputProps {
  readonly className?: string;
}

/** Commit only after the user has paused typing for this long. */
const DEBOUNCE_MS = 700;

const MODE_ICON: Record<FilterMode, typeof Asterisk> = {
  contains: Asterisk,
  exact: Equal,
  startsWith: ChevronsRight,
};

export function CityFilterInput({ className }: CityFilterInputProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const storeQ = useAppSelector((s) => s.filters.q);
  const mode = useAppSelector((s) => s.filters.mode);

  // Local typing buffer — the input renders THIS, never storeQ directly.
  const [localValue, setLocalValue] = useState(storeQ);

  // Track the last storeQ we reconciled so we can tell an external change
  // (URL paste, reset) apart from our own debounced commit echoing back.
  const [syncedStoreQ, setSyncedStoreQ] = useState(storeQ);
  if (storeQ !== syncedStoreQ) {
    setSyncedStoreQ(storeQ);
    // Adopt external changes; ignore the echo of our own commit (already equal).
    if (storeQ !== localValue) setLocalValue(storeQ);
  }

  // Commit the debounced value upstream once typing settles.
  const debounced = useDebouncedValue(localValue, DEBOUNCE_MS);
  useEffect(() => {
    if (debounced !== storeQ) {
      dispatch(setQ(debounced));
    }
    // storeQ intentionally excluded — re-running on storeQ would double-fire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasValue = localValue.length > 0;
  const ModeIcon = MODE_ICON[mode];

  const modeLabels: Record<FilterMode, string> = {
    contains: t('labels.matchContains'),
    exact: t('labels.matchExact'),
    startsWith: t('labels.matchStartsWith'),
  };
  const modeAriaLabel = `${t('labels.matchMode')}: ${modeLabels[mode]}`;

  function cycleMode(): void {
    const i = FILTER_MODES.indexOf(mode);
    const next = FILTER_MODES[(i + 1) % FILTER_MODES.length] ?? 'contains';
    dispatch(setMode(next));
  }

  function clear(): void {
    setLocalValue('');
    inputRef.current?.focus();
  }

  return (
    <div className={cn('relative inline-flex w-full', className)}>
      <ModeButton ariaLabel={modeAriaLabel} onClick={cycleMode}>
        <ModeIcon className="h-4 w-4" aria-hidden="true" />
      </ModeButton>

      <input
        ref={inputRef}
        type="search"
        autoComplete="off"
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value);
        }}
        placeholder={`${t('labels.filter')}…`}
        aria-label={`${t('labels.filter')} ${t('labels.city').toLowerCase()}`}
        className={cn(
          'border-border bg-surface block h-10 w-full rounded-md border',
          'py-2 pl-10 pr-9',
          'text-ink-primary placeholder:text-ink-tertiary text-base',
          'duration-fast transition-colors ease-out',
          'hover:border-border-strong',
          'focus:border-border-focus focus:shadow-focus focus:outline-none',
          '[&::-webkit-search-cancel-button]:appearance-none',
        )}
      />

      {hasValue ? (
        <button
          type="button"
          onClick={clear}
          aria-label={t('actions.clearFilter')}
          className={cn(
            'absolute inset-y-0 right-2 inline-flex h-full items-center justify-center rounded-md px-1',
            'text-ink-tertiary hover:text-ink-primary',
            'focus-visible:shadow-focus focus-visible:outline-none',
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

function ModeButton({
  ariaLabel,
  onClick,
  children,
}: {
  readonly ariaLabel: string;
  readonly onClick: () => void;
  readonly children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(
        'absolute inset-y-0 left-1.5 inline-flex h-full w-7 items-center justify-center rounded-md',
        'text-ink-secondary hover:bg-subtle hover:text-ink-primary',
        'focus-visible:shadow-focus focus-visible:outline-none',
      )}
    >
      {children}
    </button>
  );
}
