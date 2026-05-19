/**
 * Badge — atom.
 *
 * Status/category indicator. Color is never the sole signal — every Badge
 * pairs a color with text (and optionally an icon). Sensor variants for
 * the domain are composed in SensorBadge.tsx.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

const badge = cva(
  [
    'inline-flex items-center gap-1 rounded-full',
    'border px-2 py-0.5',
    'text-xs font-medium tracking-normal',
    'whitespace-nowrap',
  ],
  {
    variants: {
      variant: {
        neutral: 'border-border-subtle bg-subtle text-ink-secondary',
        success: 'border-success/30 bg-success/10 text-success',
        warning: 'border-warning/30 bg-warning/10 text-warning',
        error: 'border-error/30 bg-error/10 text-error',
        info: 'border-info/30 bg-info/10 text-info',
        accent: 'border-accent/30 bg-accent/10 text-accent',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export type BadgeVariant = NonNullable<VariantProps<typeof badge>['variant']>;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badge> {
  readonly leadingIcon?: ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant, leadingIcon, children, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cn(badge({ variant }), className)} {...rest}>
      {leadingIcon ? (
        <span aria-hidden="true" className="inline-flex shrink-0 [&>svg]:h-3 [&>svg]:w-3">
          {leadingIcon}
        </span>
      ) : null}
      {children}
    </span>
  );
});
