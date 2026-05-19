/**
 * Skeleton placeholder for the DataTable while initial / context-switch
 * fetches are pending. Preserves column widths so the table doesn't jump
 * when real data arrives.
 */

import { cn } from '@/lib/utils';

import { LineSkeleton } from './Skeleton';

export interface TableSkeletonProps {
  /** Number of placeholder rows. */
  readonly rows?: number;
  /** Column count — preserves grid for hard-to-predict shapes. */
  readonly columns?: number;
  readonly className?: string;
}

export function TableSkeleton({ rows = 7, columns = 4, className }: TableSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading data"
      className={cn('border-border-subtle bg-surface overflow-hidden rounded-lg border', className)}
    >
      <div className="border-border-subtle bg-subtle border-b px-4 py-3">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <LineSkeleton key={`h-${String(i)}`} width="40%" className="h-2.5" />
          ))}
        </div>
      </div>
      <div className="divide-border-subtle divide-y">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={`r-${String(r)}`}
            className="grid items-center gap-4 px-4 py-3"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, c) => (
              <LineSkeleton key={`r-${String(r)}-c-${String(c)}`} width={c === 0 ? '70%' : '50%'} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
