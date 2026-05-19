/**
 * Sort utilities — pure, testable, the way Reselect selectors will consume them.
 */

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<TCol extends string> {
  readonly column: TCol;
  readonly direction: SortDirection;
}

/**
 * Sort an array of records where some values may be null/undefined.
 * Nulls always sink to the end regardless of direction — sensor failures
 * shouldn't dominate the top of the table on ascending sort.
 *
 * Numbers compared numerically; strings via localeCompare (handles
 * Polish diacritics correctly: ą, ć, ę, etc.).
 */
export function sortWithNullsLast<T>(
  rows: readonly T[],
  getValue: (row: T) => string | number | null | undefined,
  direction: SortDirection,
): T[] {
  const sign = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const va = getValue(a);
    const vb = getValue(b);
    const aNull = va === null || va === undefined;
    const bNull = vb === null || vb === undefined;
    if (aNull && bNull) return 0;
    if (aNull) return 1;
    if (bNull) return -1;
    if (typeof va === 'string' && typeof vb === 'string') {
      return va.localeCompare(vb) * sign;
    }
    if (va < vb) return -1 * sign;
    if (va > vb) return 1 * sign;
    return 0;
  });
}
