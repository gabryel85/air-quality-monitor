import { useTranslation } from 'react-i18next';

import { useAppSelector } from '@/app/hooks';
import { TableSkeleton } from '@/components/atoms/Skeleton';
import { BarChartSkeleton } from '@/components/atoms/Skeleton';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ErrorState } from '@/components/molecules/ErrorState';
import { BarChart } from '@/components/organisms/BarChart';
import { CitiesTable } from '@/features/cities/CitiesTable';
import { useGetCitiesStatsQuery } from '@/features/cities/citiesApi';
import {
  selectCitiesError,
  selectCitiesLoading,
  selectNO2ChartData,
  selectVisibleCityCount,
} from '@/features/cities/selectors';
import { Toolbar } from '@/features/cities/Toolbar';

export function DashboardPage() {
  const { t } = useTranslation();
  const country = useAppSelector((s) => s.filters.country);
  const year = useAppSelector((s) => s.filters.year);
  const isLoading = useAppSelector(selectCitiesLoading);
  const error = useAppSelector(selectCitiesError);
  const visibleCount = useAppSelector(selectVisibleCityCount);
  const chartData = useAppSelector(selectNO2ChartData);

  const hasSelection = country !== null && year !== null;

  // refetch handler from the same query subscription used in Toolbar — pulling
  // it here too keeps the cache shared and gives us the retry handler.
  const { refetch } = useGetCitiesStatsQuery(
    hasSelection ? { countryId: country, year } : { countryId: '', year: 0 },
    { skip: !hasSelection },
  );

  return (
    <section aria-labelledby="dashboard-title" className="flex flex-col gap-6 py-6">
      <header>
        <h1 id="dashboard-title" className="text-ink-primary text-2xl font-semibold tracking-tight">
          {t('app.title')}
        </h1>
        <p className="text-ink-secondary mt-1 text-base">{t('app.subtitle')}</p>
      </header>

      <Toolbar />

      <DashboardBody
        hasSelection={hasSelection}
        isLoading={isLoading}
        error={error}
        visibleCount={visibleCount}
        chartData={chartData}
        onRetry={() => void refetch()}
      />
    </section>
  );
}

interface DashboardBodyProps {
  readonly hasSelection: boolean;
  readonly isLoading: boolean;
  readonly error: unknown;
  readonly visibleCount: number;
  readonly chartData: ReadonlyArray<{ key: string; label: string; value: number | null }>;
  readonly onRetry: () => void;
}

function DashboardBody({
  hasSelection,
  isLoading,
  error,
  visibleCount,
  chartData,
  onRetry,
}: DashboardBodyProps) {
  if (!hasSelection) {
    return <EmptyState kind="noSelection" />;
  }

  if (error) {
    return <ErrorState onRetry={onRetry} technicalDetail={error} />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <BarChartSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  if (visibleCount === 0) {
    return <EmptyState kind="noFilterResults" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <BarChart data={chartData} yAxisLabel="NO₂ max" />
      <CitiesTable />
    </div>
  );
}
