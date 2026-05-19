/**
 * Select — molecule.
 *
 * Thin token-styled wrapper over Radix Select. Radix gives us focus trap,
 * keyboard nav (Arrow keys, Home/End, type-to-select), portal-rendered
 * content, and full ARIA semantics. We keep our chrome consistent with
 * Input (height, radius, border, focus ring) for visual harmony.
 *
 * Public API is intentionally compact:
 *
 *   <Select<string>
 *     value={country}
 *     onValueChange={setCountry}
 *     placeholder="Select country"
 *     options={[{ value: 'PL', label: 'Polska' }]}
 *     loading={false}
 *     id={fieldId}
 *   />
 */

import * as RxSelect from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { forwardRef, type ReactNode } from 'react';

import { Spinner } from '@/components/atoms/Spinner';
import { cn } from '@/lib/utils';

export interface SelectOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
}

export interface SelectProps<T extends string> {
  readonly value: T | null;
  readonly onValueChange: (next: T) => void;
  readonly options: ReadonlyArray<SelectOption<T>>;
  readonly placeholder?: string;
  readonly id?: string;
  readonly describedBy?: string;
  readonly invalid?: boolean;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly emptyMessage?: string;
  readonly className?: string;
  readonly name?: string;
  /** Optional custom rendering of the trigger value display. */
  readonly renderValue?: (option: SelectOption<T>) => ReactNode;
}

const triggerClass = cn(
  'inline-flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-surface px-3',
  'text-base text-ink-primary placeholder:text-ink-tertiary',
  'transition-colors duration-fast ease-out',
  'hover:border-border-strong',
  'data-[state=open]:border-border-focus data-[state=open]:shadow-focus',
  'focus:outline-none focus-visible:border-border-focus focus-visible:shadow-focus',
  'disabled:cursor-not-allowed disabled:bg-subtle disabled:opacity-70',
  'aria-[invalid=true]:border-error aria-[invalid=true]:shadow-[0_0_0_3px_rgba(197,48,48,0.20)]',
);

export const Select = forwardRef(function Select<T extends string>(
  {
    value,
    onValueChange,
    options,
    placeholder,
    id,
    describedBy,
    invalid,
    disabled,
    loading,
    emptyMessage = 'Nothing to choose from',
    className,
    name,
    renderValue,
  }: SelectProps<T>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const isEmpty = options.length === 0 && !loading;
  const isTriggerDisabled = disabled || loading || isEmpty;
  const selectedOption = value ? (options.find((o) => o.value === value) ?? null) : null;

  return (
    <RxSelect.Root
      onValueChange={(v) => onValueChange(v as T)}
      disabled={isTriggerDisabled === true}
      {...(value !== null ? { value } : {})}
      {...(name !== undefined ? { name } : {})}
    >
      <RxSelect.Trigger
        ref={ref}
        id={id}
        aria-describedby={describedBy}
        aria-invalid={invalid ? 'true' : undefined}
        className={cn(triggerClass, className)}
      >
        <span className="truncate text-left">
          {loading ? (
            <span className="text-ink-secondary inline-flex items-center gap-2">
              <Spinner size="sm" label="Loading options" />
              <span>Loading…</span>
            </span>
          ) : selectedOption ? (
            (renderValue?.(selectedOption) ?? selectedOption.label)
          ) : (
            <span className="text-ink-tertiary">{placeholder ?? 'Select…'}</span>
          )}
        </span>
        <RxSelect.Icon className="text-ink-tertiary shrink-0" asChild>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </RxSelect.Icon>
      </RxSelect.Trigger>

      <RxSelect.Portal>
        <RxSelect.Content
          position="popper"
          sideOffset={4}
          className={cn(
            'z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden',
            'border-border bg-surface rounded-md border shadow-lg',
            'data-[state=open]:animate-slide-up-fade',
          )}
        >
          <RxSelect.ScrollUpButton className="bg-surface text-ink-tertiary flex h-6 items-center justify-center">
            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
          </RxSelect.ScrollUpButton>

          <RxSelect.Viewport className="max-h-60 p-1">
            {isEmpty ? (
              <div className="text-ink-tertiary px-3 py-2 text-sm">{emptyMessage}</div>
            ) : (
              options.map((option) => (
                <RxSelect.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled === true}
                  className={cn(
                    'relative flex cursor-default select-none items-center justify-between gap-2',
                    'rounded-sm px-3 py-1.5 text-base outline-none',
                    'text-ink-primary',
                    'data-[highlighted]:bg-subtle',
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                  )}
                >
                  <span className="flex flex-col">
                    <RxSelect.ItemText>{option.label}</RxSelect.ItemText>
                    {option.description ? (
                      <span className="text-ink-tertiary text-xs">{option.description}</span>
                    ) : null}
                  </span>
                  <RxSelect.ItemIndicator className="text-accent shrink-0">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </RxSelect.ItemIndicator>
                </RxSelect.Item>
              ))
            )}
          </RxSelect.Viewport>

          <RxSelect.ScrollDownButton className="bg-surface text-ink-tertiary flex h-6 items-center justify-center">
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </RxSelect.ScrollDownButton>
        </RxSelect.Content>
      </RxSelect.Portal>
    </RxSelect.Root>
  );
}) as <T extends string>(
  props: SelectProps<T> & { ref?: React.ForwardedRef<HTMLButtonElement> },
) => React.ReactElement;
