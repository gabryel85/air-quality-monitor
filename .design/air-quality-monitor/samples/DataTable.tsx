/**
 * DataTable — organism.
 *
 * The workspace. Sortable, nulls-aware, polling-safe.
 *
 * Generic over Row but written for cities-stats domain. Polling safety is
 * achieved at the parent level (RTK Query keeps cached data visible during
 * isFetching) — this component itself is stateless w.r.t. fetching.
 */

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Fragment, useId, type ReactNode } from 'react';

import {
  cn,
  sortWithNullsLast,
  type CityStats,
  type SortConfig,
  type SortDirection,
} from './types';

// ============================================================
// Column descriptor
// ============================================================

interface ColumnDef<Row, Col extends string> {
  readonly id: Col;
  readonly header: ReactNode;
  readonly accessor: (row: Row) => string | number | null;
  /** Right-align + tabular-nums for numeric columns. */
  readonly numeric?: boolean;
  /** Default false — column header is not a sort button. */
  readonly sortable?: boolean;
  /** Optional custom cell renderer; defaults to accessor value with null handling. */
  readonly render?: (row: Row) => ReactNode;
}

// ============================================================
// Props
// ============================================================

export interface DataTableProps<Row, Col extends string> {
  readonly columns: ReadonlyArray<ColumnDef<Row, Col>>;
  readonly rows: readonly Row[];
  readonly rowKey: (row: Row) => string;
  readonly sort: SortConfig<Col>;
  readonly onSortChange: (next: SortConfig<Col>) => void;
  readonly onRowClick?: (row: Row) => void;
  readonly density?: 'compact' | 'normal';
  /** Label announced to screen readers (e.g. "Air quality by city"). */
  readonly caption: string;
}

// ============================================================
// Component
// ============================================================

export function DataTable<Row, Col extends string>({
  columns,
  rows,
  rowKey,
  sort,
  onSortChange,
  onRowClick,
  density = 'normal',
  caption,
}: DataTableProps<Row, Col>) {
  const captionId = useId();

  // Sort applied here so the table is the single owner of presentation order.
  // For larger datasets, lift this into a Reselect selector at the page level
  // (see Task 26). Here we keep it inline for clarity in this prototype.
  const sortedRows = sortByColumn(rows, columns, sort);

  const rowPad = density === 'compact' ? 'h-9' : 'h-12';
  const cellPad = density === 'compact' ? 'px-3' : 'px-4';

  return (
    <div className="relative overflow-auto rounded-lg border border-border-subtle bg-surface">
      <table className="w-full border-collapse text-base" aria-labelledby={captionId}>
        <caption id={captionId} className="sr-only">
          {caption}
        </caption>
        <thead className="sticky top-0 z-10 bg-subtle">
          <tr className="border-b border-border-subtle">
            {columns.map((col) => {
              const isSorted = sort.column === col.id;
              const ariaSort = isSorted
                ? sort.direction === 'asc'
                  ? 'ascending'
                  : 'descending'
                : 'none';

              return (
                <th
                  key={col.id}
                  scope="col"
                  aria-sort={col.sortable ? ariaSort : undefined}
                  className={cn(
                    'text-xs font-medium uppercase tracking-wide text-ink-secondary',
                    cellPad,
                    col.numeric && 'text-right',
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(cycleSort(sort, col.id))}
                      className={cn(
                        'inline-flex items-center gap-1.5 py-3 -mx-1 px-1',
                        'rounded-sm hover:text-ink-primary',
                        'focus-visible:outline-none focus-visible:shadow-focus',
                        col.numeric && 'ml-auto',
                      )}
                    >
                      <span>{col.header}</span>
                      <SortIndicator isSorted={isSorted} direction={sort.direction} />
                    </button>
                  ) : (
                    <span className="inline-block py-3">{col.header}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className={cn('text-center text-ink-tertiary py-12', cellPad)}
              >
                No matching cities.
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                role={onRowClick ? 'button' : undefined}
                className={cn(
                  'border-b border-border-subtle transition-colors duration-fast',
                  'hover:bg-subtle',
                  'focus-visible:outline-none focus-visible:bg-subtle focus-visible:shadow-focus',
                  onRowClick && 'cursor-pointer',
                  rowPad,
                )}
              >
                {columns.map((col) => (
                  <DataCell key={col.id} row={row} column={col} cellPadding={cellPad} />
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function DataCell<Row, Col extends string>({
  row,
  column,
  cellPadding,
}: {
  row: Row;
  column: ColumnDef<Row, Col>;
  cellPadding: string;
}) {
  const value = column.accessor(row);
  const isNull = value === null || value === undefined;

  return (
    <td
      className={cn(
        'text-ink-primary',
        cellPadding,
        column.numeric && 'text-right tabular-nums font-mono text-sm',
      )}
    >
      {column.render ? (
        column.render(row)
      ) : isNull ? (
        <abbr
          title="Sensor unavailable for this measurement"
          className="text-ink-tertiary no-underline cursor-help"
          aria-label="Sensor unavailable"
        >
          —
        </abbr>
      ) : (
        <>{value}</>
      )}
    </td>
  );
}

function SortIndicator({
  isSorted,
  direction,
}: {
  isSorted: boolean;
  direction: SortDirection;
}) {
  if (!isSorted) {
    return <ArrowUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />;
  }
  return direction === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
  );
}

// ============================================================
// Sort helpers
// ============================================================

function cycleSort<Col extends string>(
  current: SortConfig<Col>,
  clickedColumn: Col,
): SortConfig<Col> {
  if (current.column !== clickedColumn) {
    return { column: clickedColumn, direction: 'asc' };
  }
  if (current.direction === 'asc') {
    return { column: clickedColumn, direction: 'desc' };
  }
  // After desc, return to default sort (city asc).
  return { column: 'city' as Col, direction: 'asc' };
}

function sortByColumn<Row, Col extends string>(
  rows: readonly Row[],
  columns: ReadonlyArray<ColumnDef<Row, Col>>,
  sort: SortConfig<Col>,
): Row[] {
  const col = columns.find((c) => c.id === sort.column);
  if (!col) return [...rows];
  // Build a temporary keyed array so sortWithNullsLast can index by string key.
  const keyed = rows.map((row) => ({ row, key: col.accessor(row) }));
  const sorted = sortWithNullsLast(keyed, 'key', sort.direction);
  return sorted.map((k) => k.row);
}

// ============================================================
// Example wiring — for Storybook + recruiter at-a-glance
// ============================================================

/**
 * Example: how DashboardPage will compose this.
 *
 *   <DataTable
 *     caption="Air quality by city"
 *     columns={cityColumns}
 *     rows={cities}
 *     rowKey={(c) => c.cityId}
 *     sort={sort}
 *     onSortChange={(next) => dispatch(setSort(next))}
 *     onRowClick={(c) => navigate(`/cities/${c.cityId}/notes`)}
 *   />
 */
export const cityColumns: ReadonlyArray<ColumnDef<CityStats, 'city' | 'maxNO2' | 'maxCO' | 'maxPM10'>> = [
  { id: 'city',    header: 'City',     accessor: (c) => c.city,    sortable: true },
  { id: 'maxNO2',  header: 'NO₂ max',  accessor: (c) => c.maxNO2,  sortable: true, numeric: true },
  { id: 'maxCO',   header: 'CO max',   accessor: (c) => c.maxCO,   sortable: true, numeric: true },
  { id: 'maxPM10', header: 'PM₁₀ max', accessor: (c) => c.maxPM10, sortable: true, numeric: true },
];

/* ============================================================
 * Aesthetic notes (Functional Confidence)
 * ============================================================
 * - Sticky header (`thead .sticky top-0 z-10`) — long lists, header always visible.
 * - Caption is screen-reader only — the visible heading is in the page chrome.
 * - Hover row uses `bg-subtle` (cream-100 / dark-700) — barely visible but enough
 *   to anchor the eye. No drop shadow, no border thickening.
 * - Numeric columns: right-aligned + `tabular-nums font-mono text-sm`. Slightly
 *   smaller than body text — denser, instrument-like.
 * - Null cell uses native `<abbr title>` for tooltip — zero JS, perfect a11y.
 * - Sort arrow in `text-accent` when active — the only chrome that uses orange.
 *   Reinforces "orange = decision/state" rule.
 * - Row pointer cursor + `role="button"` when clickable — clear affordance.
 *   Keyboard handler mirrors Enter/Space on the row.
 * - Caption + scope + aria-sort: AAA-ready table semantics.
 */
