/**
 * Spinner — atom.
 * Indeterminate loading indicator with a sr-only label. Defaults assume
 * the spinner replaces or augments a labelled control; pass `label` if
 * standalone.
 */

import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface SpinnerProps {
  readonly size?: 'sm' | 'md' | 'lg';
  readonly label?: string;
  readonly className?: string;
}

const SIZE_CLASS: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
};

export function Spinner({ size = 'md', label = 'Loading', className }: SpinnerProps) {
  return (
    <span role="status" className={cn('text-ink-secondary inline-flex items-center', className)}>
      <Loader2
        className={cn('animate-spin motion-reduce:animate-none', SIZE_CLASS[size])}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
