import { cn } from '@/lib/utils';

import { Skeleton } from './Skeleton';

export interface BarChartSkeletonProps {
  readonly bars?: number;
  readonly className?: string;
}

export function BarChartSkeleton({ bars = 7, className }: BarChartSkeletonProps) {
  /** Deterministic pseudo-random heights so each render looks alive but stable. */
  const heights = Array.from({ length: bars }, (_, i) => 30 + ((i * 17) % 60));

  return (
    <div
      role="status"
      aria-label="Loading chart"
      className={cn(
        'border-border-subtle bg-surface rounded-lg border p-4',
        'flex h-[280px] flex-col',
        className,
      )}
    >
      <div className="flex flex-1 items-end gap-3">
        {heights.map((h, i) => (
          <div key={`bar-${String(i)}`} className="flex-1">
            <Skeleton className="w-full" style={{ height: `${String(h)}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-3" style={{ gridTemplateColumns: `repeat(${bars}, 1fr)` }}>
        {heights.map((_, i) => (
          <Skeleton key={`label-${String(i)}`} className="h-2.5 w-3/4 justify-self-center" />
        ))}
      </div>
    </div>
  );
}
