import { skipToken } from '@reduxjs/toolkit/query';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '@/app/hooks';
import { PollingIndicator } from '@/components/molecules/PollingIndicator';
import { CountrySelect } from '@/features/countries/CountrySelect';
import { YearSelect } from '@/features/countries/YearSelect';
import { CityFilterInput } from '@/features/filters/CityFilterInput';
import { FilterModeSelect } from '@/features/filters/FilterModeSelect';
import { cn } from '@/lib/utils';

import { useGetCitiesStatsQuery } from './citiesApi';
import { selectCitiesError, selectLastUpdatedAt, selectVisibleCityCount } from './selectors';

const POLLING_INTERVAL_MS = 20_000;

export interface ToolbarProps {
  readonly className?: string;
}

export function Toolbar({ className }: ToolbarProps) {
  const { t } = useTranslation();
  const countryId = useAppSelector((s) => s.filters.country);
  const year = useAppSelector((s) => s.filters.year);

  // The actual poll hook. Subscribed once at this toolbar level so polling
  // continues regardless of where else the selector reads the data from.
  useGetCitiesStatsQuery(countryId && year !== null ? { countryId, year } : skipToken, {
    pollingInterval: POLLING_INTERVAL_MS,
    skipPollingIfUnfocused: false,
    refetchOnFocus: true,
  });

  const lastUpdatedAt = useAppSelector(selectLastUpdatedAt);
  const error = useAppSelector(selectCitiesError);
  const visibleCount = useAppSelector(selectVisibleCityCount);

  const countryFieldId = useId();
  const yearFieldId = useId();
  const filterFieldId = useId();
  const modeFieldId = useId();

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-end gap-3">
        <Field label={t('labels.country')} htmlFor={countryFieldId} className="min-w-[180px]">
          <CountrySelect id={countryFieldId} />
        </Field>
        <Field label={t('labels.year')} htmlFor={yearFieldId} className="min-w-[120px]">
          <YearSelect id={yearFieldId} />
        </Field>
        <Field label={t('labels.filter')} htmlFor={filterFieldId} className="min-w-[200px] flex-1">
          <CityFilterInput />
        </Field>
        <Field label={t('labels.matchMode')} htmlFor={modeFieldId} className="min-w-[140px]">
          <FilterModeSelect id={modeFieldId} />
        </Field>
        <div className="ml-auto flex items-center pb-1">
          <PollingIndicator lastUpdatedAt={lastUpdatedAt} isError={Boolean(error)} />
        </div>
      </div>

      {/* Live region for SR users: announces filter-count changes. */}
      <p className="sr-only" role="status" aria-live="polite">
        {countryId && year !== null
          ? `${String(visibleCount)} ${t('labels.city').toLowerCase()}`
          : ''}
      </p>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  readonly label: string;
  readonly htmlFor: string;
  readonly className?: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label
        htmlFor={htmlFor}
        className="text-ink-secondary text-xs font-medium uppercase tracking-wide"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
