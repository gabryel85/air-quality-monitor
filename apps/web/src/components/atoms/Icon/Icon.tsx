/**
 * Icon — atom.
 *
 * Wrapper around lucide-react icons that enforces:
 *   - Consistent stroke width
 *   - One of the allowed sizes
 *   - aria-hidden by default (icons are decorative unless captioned)
 *
 * For meaningful icons, pass `label` — that flips aria-hidden off and adds
 * a proper aria-label.
 *
 * Usage:
 *   <Icon as={Search} size="sm" />              // decorative
 *   <Icon as={AlertTriangle} label="Error" />   // meaningful
 */

import type { LucideIcon, LucideProps } from 'lucide-react';

import { cn } from '@/lib/utils';

const SIZE_CLASS = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6',
} as const;

export type IconSize = keyof typeof SIZE_CLASS;

export interface IconProps extends Omit<LucideProps, 'size' | 'aria-hidden' | 'aria-label'> {
  readonly as: LucideIcon;
  readonly size?: IconSize;
  /** Pass for meaningful icons; omit for decorative. */
  readonly label?: string;
}

export function Icon({ as: Component, size = 'md', label, className, ...rest }: IconProps) {
  return (
    <Component
      className={cn(SIZE_CLASS[size], className)}
      strokeWidth={1.75}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      {...rest}
    />
  );
}
