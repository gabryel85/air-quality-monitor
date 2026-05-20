import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { CityCard } from '@/components/organisms/CityCard';
import { DataTable, type ColumnDef } from '@/components/organisms/DataTable';
import type { SortConfig } from '@/lib/sort';
import { cn } from '@/lib/utils';

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
  const location = useLocation();

  const rows = useAppSelector(selectSortedCities);
  const sort = useAppSelector(selectSortConfig);

  const columns = useMemo<ReadonlyArray<ColumnDef<CityStatsRow, SortableColumn>>>(
    () => [
      { id: 'city', header: t('labels.city'), accessor: (r) => r.city, sortable: true },
      { id: 'maxNO2', header: 'NO₂', accessor: (r) => r.maxNO2, sortable: true, numeric: true },
      { id: 'maxCO', header: 'CO', accessor: (r) => r.maxCO, sortable: true, numeric: true },
      { id: 'maxPM10', header: 'PM₁₀', accessor: (r) => r.maxPM10, sortable: true, numeric: true },
    ],
    [t],
  );

  const handleSortChange = useCallback(
    (next: SortConfig<SortableColumn>) => {
      dispatch(setSort(next));
    },
    [dispatch],
  );

  const openNotes = useCallback(
    (cityId: string) => {
      // Carry the country/year/filter query string so the city view keeps the
      // dashboard context — and a refresh there still knows which year to show.
      navigate({
        pathname: `/cities/${encodeURIComponent(cityId)}/notes`,
        search: location.search,
      });
    },
    [navigate, location.search],
  );

  return (
    <>
      {/* Desktop / tablet: full sortable table */}
      <div className={cn('hidden sm:block', className)}>
        <DataTable<CityStatsRow, SortableColumn>
          columns={columns}
          rows={rows}
          rowKey={(r) => r.cityId}
          sort={sort}
          onSortChange={handleSortChange}
          defaultSortColumn={DEFAULT_SORT.column}
          onRowClick={(row) => {
            openNotes(row.cityId);
          }}
          caption={t('app.title')}
          testId="cities-table"
          skipSort
        />
      </div>

      {/* Mobile: tappable cards. Sort isn't exposed here yet (sort is a
          desktop power-user feature; mobile uses default + filter). */}
      <ul
        className={cn('flex flex-col gap-2 sm:hidden', className)}
        aria-label={t('app.title')}
        data-testid="cities-cards"
      >
        {rows.map((row) => (
          <li key={row.cityId}>
            <CityCard row={row} onOpen={openNotes} />
          </li>
        ))}
      </ul>
    </>
  );
}
