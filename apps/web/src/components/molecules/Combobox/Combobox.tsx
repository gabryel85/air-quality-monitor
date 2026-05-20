/**
 * Combobox — molecule.
 *
 * A searchable single-select. Radix Popover provides the floating panel +
 * focus management; cmdk provides the filtered, keyboard-navigable list
 * (type-to-filter, Arrow keys, Enter to pick, fully ARIA-correct).
 *
 * API mirrors the plain Select molecule so the two are swap-compatible:
 *
 *   <Combobox<string>
 *     value={country}
 *     onValueChange={setCountry}
 *     options={[{ value: 'PL', label: 'Polska' }]}
 *     placeholder="Select country"
 *     searchPlaceholder="Search…"
 *     emptyMessage="No match"
 *   />
 */

import * as Popover from '@radix-ui/react-popover';
import { Command } from 'cmdk';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { Spinner } from '@/components/atoms/Spinner';
import { cn } from '@/lib/utils';

export interface ComboboxOption<T extends string> {
  readonly value: T;
  readonly label: string;
  /** Extra text matched by the search filter (e.g. an ISO code). */
  readonly keywords?: readonly string[];
}

export interface ComboboxProps<T extends string> {
  readonly value: T | null;
  readonly onValueChange: (next: T) => void;
  readonly options: ReadonlyArray<ComboboxOption<T>>;
  readonly placeholder?: string;
  readonly searchPlaceholder?: string;
  readonly emptyMessage?: string;
  readonly id?: string;
  readonly describedBy?: string;
  readonly invalid?: boolean;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly className?: string;
}

const triggerClass = cn(
  'inline-flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-surface px-3',
  'text-base text-ink-primary',
  'transition-colors duration-fast ease-out',
  'hover:border-border-strong',
  'data-[state=open]:border-border-focus data-[state=open]:shadow-focus',
  'focus:outline-none focus-visible:border-border-focus focus-visible:shadow-focus',
  'disabled:cursor-not-allowed disabled:bg-subtle disabled:opacity-70',
  'aria-[invalid=true]:border-error aria-[invalid=true]:shadow-[0_0_0_3px_rgba(197,48,48,0.20)]',
);

export function Combobox<T extends string>({
  value,
  onValueChange,
  options,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyMessage = 'No results',
  id,
  describedBy,
  invalid,
  disabled,
  loading,
  className,
}: ComboboxProps<T>): ReactNode {
  const [open, setOpen] = useState(false);
  const isEmpty = options.length === 0 && loading !== true;
  const isDisabled = disabled === true || loading === true || isEmpty;
  const selected = value !== null ? (options.find((o) => o.value === value) ?? null) : null;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        id={id}
        disabled={isDisabled}
        aria-describedby={describedBy}
        aria-invalid={invalid ? 'true' : undefined}
        className={cn(triggerClass, className)}
      >
        <span className="truncate text-left">
          {loading === true ? (
            <span className="text-ink-secondary inline-flex items-center gap-2">
              <Spinner size="sm" label="Loading options" />
              <span>Loading…</span>
            </span>
          ) : selected ? (
            selected.label
          ) : (
            <span className="text-ink-tertiary">{placeholder}</span>
          )}
        </span>
        <ChevronsUpDown className="text-ink-tertiary h-4 w-4 shrink-0" aria-hidden="true" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className={cn(
            'z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden',
            'border-border bg-surface rounded-md border shadow-lg',
            'data-[state=open]:animate-slide-up-fade',
          )}
        >
          <Command
            // cmdk's built-in filter — case-insensitive substring over the
            // item value + keywords. Returns 1 (keep) or 0 (drop).
            filter={(itemValue, search, keywords) => {
              const haystack = `${itemValue} ${keywords?.join(' ') ?? ''}`.toLowerCase();
              return haystack.includes(search.toLowerCase()) ? 1 : 0;
            }}
          >
            <div className="border-border-subtle border-b px-3">
              <Command.Input
                placeholder={searchPlaceholder}
                className={cn(
                  'text-ink-primary h-10 w-full bg-transparent text-base',
                  'placeholder:text-ink-tertiary focus:outline-none',
                )}
              />
            </div>
            <Command.List className="max-h-60 overflow-y-auto p-1">
              <Command.Empty className="text-ink-tertiary px-3 py-2 text-sm">
                {emptyMessage}
              </Command.Empty>
              {options.map((option) => (
                <Command.Item
                  key={option.value}
                  value={option.label}
                  {...(option.keywords ? { keywords: [...option.keywords] } : {})}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex cursor-default select-none items-center justify-between gap-2',
                    'text-ink-primary rounded-sm px-3 py-1.5 text-base outline-none',
                    'data-[selected=true]:bg-subtle',
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {option.value === value ? (
                    <Check className="text-accent h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : null}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
