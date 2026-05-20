import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Combobox, type ComboboxOption } from '@/components/molecules/Combobox';
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

  const options = useMemo<ComboboxOption<string>[]>(
    // ISO code is a search keyword too — typing "PL" finds Polska.
    () => (data ?? []).map((c) => ({ value: c.id, label: c.name, keywords: [c.id] })),
    [data],
  );

  return (
    <Combobox<string>
      value={country}
      onValueChange={(next) => {
        dispatch(setCountry(next));
      }}
      options={options}
      placeholder={t('labels.country')}
      searchPlaceholder={t('labels.searchCountry')}
      emptyMessage={isError ? t('states.error.title') : t('labels.noCountryFound')}
      loading={isLoading}
      invalid={isError}
      {...(id !== undefined ? { id } : {})}
      {...(describedBy !== undefined ? { describedBy } : {})}
      {...(className !== undefined ? { className } : {})}
    />
  );
}
