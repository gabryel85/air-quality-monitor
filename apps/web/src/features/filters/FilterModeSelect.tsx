import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Select, type SelectOption } from '@/components/molecules/Select';

import { FILTER_MODES, setMode, type FilterMode } from './filtersSlice';

export interface FilterModeSelectProps {
  readonly id?: string;
  readonly className?: string;
}

export function FilterModeSelect({ id, className }: FilterModeSelectProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.filters.mode);

  const options = useMemo<SelectOption<FilterMode>[]>(
    () =>
      FILTER_MODES.map((m) => ({
        value: m,
        label:
          m === 'contains'
            ? t('labels.matchContains')
            : m === 'exact'
              ? t('labels.matchExact')
              : t('labels.matchStartsWith'),
      })),
    [t],
  );

  return (
    <Select<FilterMode>
      value={mode}
      onValueChange={(next) => dispatch(setMode(next))}
      options={options}
      placeholder={t('labels.matchMode')}
      {...(id !== undefined ? { id } : {})}
      {...(className !== undefined ? { className } : {})}
    />
  );
}
