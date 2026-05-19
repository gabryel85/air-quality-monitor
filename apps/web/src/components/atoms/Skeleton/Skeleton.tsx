/**
 * Skeleton — atom primitive.
 *
 * Decorative placeholder rendered while content loads. Animation honors
 * `prefers-reduced-motion: reduce` (Tailwind handles this via the global
 * rule in tokens.css that nulls all transition-duration under that media
 * query — the pulse keyframe still fires but the perceived motion is
 * eliminated by the global override).
 */

import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Disable shimmer (e.g. for screenshot tests). */
  readonly motion?: boolean;
}

export function Skeleton({ className, motion = true, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-skeleton rounded-md',
        motion ? 'animate-skeleton-pulse motion-reduce:animate-none' : '',
        className,
      )}
      {...rest}
    />
  );
}

export function LineSkeleton({
  width = '100%',
  className,
  ...rest
}: SkeletonProps & { readonly width?: string | number }) {
  return <Skeleton className={cn('h-3', className)} style={{ width }} {...rest} />;
}

export function BlockSkeleton({ className, ...rest }: SkeletonProps) {
  return <Skeleton className={cn('h-24 w-full', className)} {...rest} />;
}

export function CircleSkeleton({
  size = 32,
  className,
  ...rest
}: SkeletonProps & { readonly size?: number }) {
  return (
    <Skeleton
      className={cn('rounded-full', className)}
      style={{ width: size, height: size }}
      {...rest}
    />
  );
}
