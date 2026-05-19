import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { DataTable, type ColumnDef } from '@/components/organisms/DataTable';
import type { SortConfig } from '@/lib/sort';

import type { CityStatsRow } from './citiesApi';
import { selectSortedCities, selectSortConfig } from './selectors';
import { DEFAULT_SORT, setSort, type SortableColumn } from './tableSlice';

export interface CitiesTableProps {
  readonly className?: string;
}

export function CitiesTable({ className }: CitiesTableProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const rows = useAppSelector(selectSortedCities);
  const sort = useAppSelector(selectSortConfig);

  const columns = useMemo<ReadonlyArray<ColumnDef<CityStatsRow, SortableColumn>>>(
    () => [
      {
        id: 'city',
        header: t('labels.city'),
        accessor: (r) => r.city,
        sortable: true,
      },
      {
        id: 'maxNO2',
        header: 'NO₂',
        accessor: (r) => r.maxNO2,
        sortable: true,
        numeric: true,
      },
      {
        id: 'maxCO',
        header: 'CO',
        accessor: (r) => r.maxCO,
        sortable: true,
        numeric: true,
      },
      {
        id: 'maxPM10',
        header: 'PM₁₀',
        accessor: (r) => r.maxPM10,
        sortable: true,
        numeric: true,
      },
    ],
    [t],
  );

  const handleSortChange = useCallback(
    (next: SortConfig<SortableColumn>) => {
      dispatch(setSort(next));
    },
    [dispatch],
  );

  const handleRowClick = useCallback(
    (row: CityStatsRow) => {
      navigate(`/cities/${encodeURIComponent(row.cityId)}/notes`);
    },
    [navigate],
  );

  return (
    <DataTable<CityStatsRow, SortableColumn>
      columns={columns}
      rows={rows}
      rowKey={(r) => r.cityId}
      sort={sort}
      onSortChange={handleSortChange}
      defaultSortColumn={DEFAULT_SORT.column}
      onRowClick={handleRowClick}
      caption={t('app.title')}
      skipSort
      {...(className !== undefined ? { className } : {})}
    />
  );
}
