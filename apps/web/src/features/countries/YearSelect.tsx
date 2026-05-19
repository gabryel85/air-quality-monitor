import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Select, type SelectOption } from '@/components/molecules/Select';
import { setYear } from '@/features/filters/filtersSlice';

import { useGetYearsQuery } from './countriesApi';

export interface YearSelectProps {
  readonly id?: string;
  readonly describedBy?: string;
  readonly className?: string;
}

export function YearSelect({ id, describedBy, className }: YearSelectProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const country = useAppSelector((s) => s.filters.country);
  const year = useAppSelector((s) => s.filters.year);

  const { data, isLoading, isError } = useGetYearsQuery(country ?? '', {
    skip: !country,
  });

  const options = useMemo<SelectOption<string>[]>(
    () => (data ?? []).map((y) => ({ value: String(y), label: String(y) })),
    [data],
  );

  return (
    <Select<string>
      value={year !== null ? String(year) : null}
      onValueChange={(next) => {
        const parsed = Number(next);
        if (Number.isFinite(parsed)) dispatch(setYear(parsed));
      }}
      options={options}
      placeholder={t('labels.year')}
      loading={isLoading}
      invalid={isError}
      disabled={!country}
      {...(isError ? { emptyMessage: t('states.error.title') } : {})}
      {...(id !== undefined ? { id } : {})}
      {...(describedBy !== undefined ? { describedBy } : {})}
      {...(className !== undefined ? { className } : {})}
    />
  );
}
