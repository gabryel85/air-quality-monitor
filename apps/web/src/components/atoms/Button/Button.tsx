/**
 * Button — atom.
 *
 * Aesthetic anchor for the Functional Confidence philosophy.
 * Restrained, instrument-like, single orange accent reserved for primary action.
 */

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

const button = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-semibold tracking-normal whitespace-nowrap',
    'rounded-md border',
    'transition-[background-color,border-color,color,box-shadow] duration-fast ease-out',
    'focus-visible:outline-none focus-visible:shadow-focus',
    'disabled:pointer-events-none disabled:opacity-50',
    'touch-manipulation select-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'border-transparent',
          'bg-accent text-ink-on-accent',
          'hover:bg-accent-hover',
          'active:bg-accent-active',
        ],
        secondary: [
          'border-border bg-surface text-ink-primary',
          'hover:bg-subtle hover:border-border-strong',
          'active:bg-muted',
        ],
        ghost: [
          'border-transparent bg-transparent text-ink-primary',
          'hover:bg-subtle',
          'active:bg-muted',
        ],
        destructive: [
          'border-transparent bg-error text-ink-on-accent',
          'hover:opacity-90',
          'active:opacity-80',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm gap-1.5',
        md: 'h-10 px-4 text-base gap-2',
        lg: 'h-12 px-6 text-md gap-2.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonVariant = NonNullable<VariantProps<typeof button>['variant']>;
export type ButtonSize = NonNullable<VariantProps<typeof button>['size']>;

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {
  /** Render as a different element (e.g. <Link>) while keeping styles + a11y semantics. */
  readonly asChild?: boolean;
  /** Replace label with spinner; keeps the button's width so layout doesn't shift. */
  readonly loading?: boolean;
  /** Optional leading icon (decorative; pair with text). */
  readonly leadingIcon?: ReactNode;
  /** Optional trailing icon (decorative; pair with text). */
  readonly trailingIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    asChild = false,
    loading = false,
    leadingIcon,
    trailingIcon,
    variant,
    size,
    disabled,
    className,
    children,
    ...rest
  },
  ref,
) {
  const Comp = asChild ? Slot : 'button';
  const isDisabled = disabled || loading;

  return (
    <Comp
      ref={ref}
      className={cn(button({ variant, size }), className)}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      {...rest}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading</span>
          <span aria-hidden="true" className="opacity-0">
            {children}
          </span>
        </>
      ) : (
        <>
          {leadingIcon ? (
            <span aria-hidden="true" className="inline-flex shrink-0">
              {leadingIcon}
            </span>
          ) : null}
          {children}
          {trailingIcon ? (
            <span aria-hidden="true" className="inline-flex shrink-0">
              {trailingIcon}
            </span>
          ) : null}
        </>
      )}
    </Comp>
  );
});
