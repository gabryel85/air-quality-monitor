import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Select, type SelectOption } from '@/components/molecules/Select';
import { setCountry } from '@/features/filters/filtersSlice';

import { useGetCountriesQuery } from './countriesApi';

export interface CountrySelectProps {
  readonly id?: string;
  readonly describedBy?: string;
  readonly className?: string;
}

export function CountrySelect({ id, describedBy, className }: CountrySelectProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const country = useAppSelector((s) => s.filters.country);

  const { data, isLoading, isError } = useGetCountriesQuery();

  const options = useMemo<SelectOption<string>[]>(
    () => (data ?? []).map((c) => ({ value: c.id, label: c.name })),
    [data],
  );

  return (
    <Select<string>
      value={country}
      onValueChange={(next) => {
        dispatch(setCountry(next));
      }}
      options={options}
      placeholder={t('labels.country')}
      loading={isLoading}
      invalid={isError}
      {...(isError ? { emptyMessage: t('states.error.title') } : {})}
      {...(id !== undefined ? { id } : {})}
      {...(describedBy !== undefined ? { describedBy } : {})}
      {...(className !== undefined ? { className } : {})}
    />
  );
}
