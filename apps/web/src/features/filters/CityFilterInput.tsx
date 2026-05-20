/**
 * CityFilterInput — feature.
 *
 * Search-style input with TWO inline action buttons:
 *   - left: mode-cycle button that flips contains → exact → startsWith
 *     (icon-only, aria-label states the current mode + that clicking
 *      cycles). The mode is global filter state in Redux + URL.
 *   - right: clear-X button when the field has content.
 *
 * The input itself owns its local typing buffer (debounced 300ms before
 * committing to Redux) to avoid re-dispatching on every keystroke.
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

const DEBOUNCE_MS = 300;

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

  const modeLabels: Record<FilterMode, string> = {
    contains: t('labels.matchContains'),
    exact: t('labels.matchExact'),
    startsWith: t('labels.matchStartsWith'),
  };

  return (
    <CityFilterInputInner
      key={storeQ}
      initialValue={storeQ}
      mode={mode}
      modeLabels={modeLabels}
      onCommit={(next) => {
        if (next !== storeQ) dispatch(setQ(next));
      }}
      onCycleMode={() => {
        const i = FILTER_MODES.indexOf(mode);
        const nextMode = FILTER_MODES[(i + 1) % FILTER_MODES.length] ?? 'contains';
        dispatch(setMode(nextMode));
      }}
      placeholder={`${t('labels.filter')}…`}
      ariaLabel={`${t('labels.filter')} ${t('labels.city').toLowerCase()}`}
      clearLabel={t('actions.clearFilter')}
      modeAriaLabel={t('labels.matchMode')}
      {...(className !== undefined ? { className } : {})}
    />
  );
}

interface InnerProps {
  readonly initialValue: string;
  readonly mode: FilterMode;
  readonly modeLabels: Record<FilterMode, string>;
  readonly onCommit: (next: string) => void;
  readonly onCycleMode: () => void;
  readonly placeholder?: string;
  readonly ariaLabel?: string;
  readonly clearLabel: string;
  readonly modeAriaLabel: string;
  readonly className?: string;
}

function CityFilterInputInner({
  initialValue,
  mode,
  modeLabels,
  onCommit,
  onCycleMode,
  placeholder,
  ariaLabel,
  clearLabel,
  modeAriaLabel,
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

  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasValue = localValue.length > 0;
  const ModeIcon = MODE_ICON[mode];
  const currentModeLabel = modeLabels[mode];

  function handleClear(): void {
    setLocalValue('');
    inputRef.current?.focus();
  }

  return (
    <div className={cn('relative inline-flex w-full', className)}>
      <ModeButton
        modeAriaLabel={modeAriaLabel}
        currentModeLabel={currentModeLabel}
        onClick={onCycleMode}
      >
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
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          'border-border bg-surface block w-full rounded-md border',
          'h-10 py-2 pl-10 pr-9',
          'text-ink-primary placeholder:text-ink-tertiary text-base',
          'duration-fast transition-colors ease-out',
          'hover:border-border-strong',
          'focus:border-border-focus focus:shadow-focus focus:outline-none',
          /* Hide the native search ::-webkit-search-cancel-button; we render our own X. */
          '[&::-webkit-search-cancel-button]:appearance-none',
        )}
      />

      {hasValue ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label={clearLabel}
          className={cn(
            'absolute inset-y-0 right-2 inline-flex items-center justify-center',
            'text-ink-tertiary hover:text-ink-primary h-full px-1',
            'focus-visible:shadow-focus rounded-md focus-visible:outline-none',
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

function ModeButton({
  modeAriaLabel,
  currentModeLabel,
  onClick,
  children,
}: {
  readonly modeAriaLabel: string;
  readonly currentModeLabel: string;
  readonly onClick: () => void;
  readonly children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${modeAriaLabel}: ${currentModeLabel}`}
      title={`${modeAriaLabel}: ${currentModeLabel}`}
      className={cn(
        'absolute inset-y-0 left-1.5 inline-flex h-full w-7 items-center justify-center',
        'text-ink-secondary hover:text-ink-primary hover:bg-subtle',
        'rounded-md',
        'focus-visible:shadow-focus focus-visible:outline-none',
      )}
    >
      {children}
    </button>
  );
}
