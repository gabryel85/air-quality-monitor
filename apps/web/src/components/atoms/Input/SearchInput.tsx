import { Search, X } from 'lucide-react';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  type InputHTMLAttributes,
} from 'react';

import { cn } from '@/lib/utils';

import { inputClassName } from './inputStyles';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  readonly value: string;
  readonly onValueChange: (next: string) => void;
  readonly inputSize?: 'sm' | 'md' | 'lg';
  readonly clearAriaLabel?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  {
    value,
    onValueChange,
    inputSize = 'md',
    clearAriaLabel = 'Clear',
    className,
    placeholder,
    ...rest
  },
  ref,
) {
  const innerRef = useRef<HTMLInputElement | null>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

  const clear = useCallback(() => {
    onValueChange('');
    innerRef.current?.focus();
  }, [onValueChange]);

  const iconSize = inputSize === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const inset = inputSize === 'sm' ? 'left-2' : inputSize === 'lg' ? 'left-4' : 'left-3';
  const trailingInset = inputSize === 'sm' ? 'right-2' : inputSize === 'lg' ? 'right-3' : 'right-2';

  const hasValue = value.length > 0;

  return (
    <div className={cn('relative inline-flex w-full', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'text-ink-tertiary pointer-events-none absolute inset-y-0 flex items-center',
          inset,
        )}
      >
        <Search className={iconSize} />
      </span>
      <input
        ref={innerRef}
        type="search"
        autoComplete="off"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          inputClassName({ size: inputSize, hasLeadingIcon: true, hasTrailingIcon: hasValue }),
          /* Mute the native ::-webkit-search-cancel-button — we render our own. */
          '[&::-webkit-search-cancel-button]:appearance-none',
        )}
        {...rest}
      />
      {hasValue ? (
        <button
          type="button"
          onClick={clear}
          aria-label={clearAriaLabel}
          className={cn(
            'absolute inset-y-0 inline-flex items-center justify-center',
            'text-ink-tertiary hover:text-ink-primary h-full px-1',
            'focus-visible:shadow-focus rounded-md focus-visible:outline-none',
            trailingInset,
          )}
        >
          <X className={iconSize} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
});
