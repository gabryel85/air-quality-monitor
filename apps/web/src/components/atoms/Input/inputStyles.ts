/**
 * Internal CVA recipe + helper for input-shaped elements. Shared between
 * Input.tsx and SearchInput.tsx so they look identical.
 */

import { cva, type VariantProps } from 'class-variance-authority';

export const input = cva(
  [
    'block w-full rounded-md border bg-surface',
    'text-base text-ink-primary placeholder:text-ink-tertiary',
    'transition-colors duration-fast ease-out',
    'hover:border-border-strong',
    'focus:outline-none focus:border-border-focus focus:shadow-focus',
    'disabled:cursor-not-allowed disabled:bg-subtle disabled:opacity-70',
    'aria-[invalid=true]:border-error aria-[invalid=true]:shadow-[0_0_0_3px_rgba(197,48,48,0.20)]',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 px-2.5 text-sm',
        md: 'h-10 px-3 text-base',
        lg: 'h-12 px-4 text-md',
      },
      hasLeadingIcon: { true: '', false: '' },
      hasTrailingIcon: { true: '', false: '' },
    },
    compoundVariants: [
      { hasLeadingIcon: true, size: 'sm', class: 'pl-7' },
      { hasLeadingIcon: true, size: 'md', class: 'pl-9' },
      { hasLeadingIcon: true, size: 'lg', class: 'pl-11' },
      { hasTrailingIcon: true, size: 'sm', class: 'pr-7' },
      { hasTrailingIcon: true, size: 'md', class: 'pr-9' },
      { hasTrailingIcon: true, size: 'lg', class: 'pr-11' },
    ],
    defaultVariants: {
      size: 'md',
      hasLeadingIcon: false,
      hasTrailingIcon: false,
    },
  },
);

export type InputSize = NonNullable<VariantProps<typeof input>['size']>;

export function inputClassName(opts: {
  size?: InputSize;
  hasLeadingIcon?: boolean;
  hasTrailingIcon?: boolean;
}): string {
  return input({
    size: opts.size ?? 'md',
    hasLeadingIcon: opts.hasLeadingIcon ?? false,
    hasTrailingIcon: opts.hasTrailingIcon ?? false,
  });
}
