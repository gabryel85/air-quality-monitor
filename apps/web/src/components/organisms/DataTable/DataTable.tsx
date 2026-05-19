/**
 * DataTable — organism. The workspace.
 *
 * Sortable, nulls-aware, polling-safe. Generic over <Row> (any record) and
 * <Col> (string union of sortable column ids).
 *
 * Sorting is applied here so the table is the single owner of presentation
 * order. For datasets with derived columns or expensive comparisons, lift
 * sorting into a Reselect selector at the page level and pass already-sorted
 * `rows` (skipSort flag).
 */

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useId, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { sortWithNullsLast, type SortConfig, type SortDirection } from '@/lib/sort';
import { cn } from '@/lib/utils';

// ============================================================
// Column descriptor
// ============================================================

export interface ColumnDef<Row, Col extends string> {
  readonly id: Col;
  readonly header: ReactNode;
  readonly accessor: (row: Row) => string | number | null | undefined;
  /** Right-align + tabular-nums for numeric columns. */
  readonly numeric?: boolean;
  /** False (default) — column header is not a sort button. */
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
  /** Default sort column to return to after the 3rd click on a sorted column. */
  readonly defaultSortColumn?: Col;
  readonly onRowClick?: (row: Row) => void;
  readonly density?: 'compact' | 'normal';
  /** Label announced to screen readers (e.g. "Air quality by city"). */
  readonly caption: string;
  /** Skip sorting inside this component (caller passes pre-sorted rows). */
  readonly skipSort?: boolean;
  readonly className?: string;
  /** Hook for tests / dev tools — rendered as data-testid on the outer wrapper. */
  readonly testId?: string;
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
  defaultSortColumn,
  onRowClick,
  density = 'normal',
  caption,
  skipSort = false,
  className,
  testId,
}: DataTableProps<Row, Col>) {
  const { t } = useTranslation();
  const captionId = useId();

  const sortedRows = useMemo(() => {
    if (skipSort) return rows;
    const col = columns.find((c) => c.id === sort.column);
    if (!col) return [...rows];
    return sortWithNullsLast(rows, col.accessor, sort.direction);
  }, [rows, columns, sort, skipSort]);

  const rowPad = density === 'compact' ? 'h-9' : 'h-12';
  const cellPad = density === 'compact' ? 'px-3' : 'px-4';

  function handleHeaderClick(columnId: Col): void {
    onSortChange(cycleSort(sort, columnId, defaultSortColumn));
  }

  return (
    <div
      data-testid={testId}
      className={cn(
        'border-border-subtle bg-surface relative overflow-auto rounded-lg border',
        className,
      )}
    >
      <table className="w-full border-collapse text-base" aria-labelledby={captionId}>
        <caption id={captionId} className="sr-only">
          {caption}
        </caption>
        <thead className="bg-subtle sticky top-0 z-10">
          <tr className="border-border-subtle border-b">
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
                  aria-sort={col.sortable === true ? ariaSort : undefined}
                  className={cn(
                    'text-ink-secondary text-xs font-medium uppercase tracking-wide',
                    cellPad,
                    col.numeric === true && 'text-right',
                  )}
                >
                  {col.sortable === true ? (
                    <button
                      type="button"
                      onClick={() => {
                        handleHeaderClick(col.id);
                      }}
                      className={cn(
                        '-mx-1 inline-flex items-center gap-1.5 rounded-sm px-1 py-3',
                        'hover:text-ink-primary',
                        'focus-visible:shadow-focus focus-visible:outline-none',
                        col.numeric === true && 'ml-auto',
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
                className={cn('text-ink-tertiary py-12 text-center', cellPad)}
              >
                {t('states.noFilterResults.title')}
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
                  'border-border-subtle duration-fast border-b transition-colors',
                  'hover:bg-subtle',
                  'focus-visible:bg-subtle focus-visible:shadow-focus focus-visible:outline-none',
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
  readonly row: Row;
  readonly column: ColumnDef<Row, Col>;
  readonly cellPadding: string;
}) {
  const { t } = useTranslation();
  const value = column.accessor(row);
  const isNull = value === null || value === undefined;

  return (
    <td
      className={cn(
        'text-ink-primary',
        cellPadding,
        column.numeric === true && 'text-right font-mono text-sm tabular-nums',
      )}
    >
      {column.render ? (
        column.render(row)
      ) : isNull ? (
        <abbr
          title={t('states.sensorUnavailable')}
          className="text-ink-tertiary cursor-help no-underline"
          aria-label={t('states.sensorUnavailable')}
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
  readonly isSorted: boolean;
  readonly direction: SortDirection;
}) {
  if (!isSorted) {
    return <ArrowUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />;
  }
  return direction === 'asc' ? (
    <ArrowUp className="text-accent h-3.5 w-3.5" aria-hidden="true" />
  ) : (
    <ArrowDown className="text-accent h-3.5 w-3.5" aria-hidden="true" />
  );
}

// ============================================================
// Sort cycling
// ============================================================

function cycleSort<Col extends string>(
  current: SortConfig<Col>,
  clickedColumn: Col,
  defaultColumn?: Col,
): SortConfig<Col> {
  if (current.column !== clickedColumn) {
    return { column: clickedColumn, direction: 'asc' };
  }
  if (current.direction === 'asc') {
    return { column: clickedColumn, direction: 'desc' };
  }
  // After desc, return to default sort.
  return {
    column: defaultColumn ?? clickedColumn,
    direction: 'asc',
  };
}
