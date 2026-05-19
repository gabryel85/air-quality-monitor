/**
 * Shared domain types and utility imports referenced by sample components.
 * In the real implementation these split across:
 *   - packages/shared-types/  (DTOs)
 *   - apps/web/src/lib/utils.ts  (cn helper)
 *   - apps/web/src/lib/sort.ts  (sortWithNullsLast)
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes safely. `clsx` handles conditional class lists;
 * `twMerge` resolves conflicting Tailwind utilities (e.g. `px-2 px-4` → `px-4`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================
// Domain types
// ============================================================

export type CountryId = string; // ISO 3166-1 alpha-2: 'PL', 'DE', 'FR'

export interface Country {
  readonly id: CountryId;
  readonly name: string;
}

export interface CityStats {
  readonly cityId: string;
  readonly city: string;
  readonly maxNO2: number | null;
  readonly maxCO: number | null;
  readonly maxPM10: number | null;
}

export interface Note {
  readonly id: number;
  readonly cityId: string;
  readonly title: string;
  readonly content: string;
  readonly createdAt: string; // ISO 8601
  readonly updatedAt: string; // ISO 8601
}

// ============================================================
// Sort utilities (used by DataTable)
// ============================================================

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<TCol extends string> {
  readonly column: TCol;
  readonly direction: SortDirection;
}

/**
 * Sort an array of records where some values may be null.
 * Nulls always sink to the end regardless of direction — sensor failures
 * shouldn't dominate the top of the table on ascending sort.
 */
export function sortWithNullsLast<T, K extends keyof T>(
  rows: readonly T[],
  column: K,
  direction: SortDirection,
): T[] {
  const sign = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const va = a[column];
    const vb = b[column];
    const aNull = va === null || va === undefined;
    const bNull = vb === null || vb === undefined;
    if (aNull && bNull) return 0;
    if (aNull) return 1; // a sinks
    if (bNull) return -1; // b sinks
    if (typeof va === 'string' && typeof vb === 'string') {
      return va.localeCompare(vb) * sign;
    }
    if (va < vb) return -1 * sign;
    if (va > vb) return 1 * sign;
    return 0;
  });
}
