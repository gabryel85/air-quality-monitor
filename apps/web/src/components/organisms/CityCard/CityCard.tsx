/**
 * CityCard — organism. Mobile alternative to a DataTable row.
 *
 * On `<sm` viewports the 4-column data table is uncomfortable to scan.
 * Each city renders instead as a card stacking the metrics as
 * `label: value` rows, the same surface and motion as NoteCard, with
 * the same "stretched button" a11y pattern.
 */

import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { CityStatsRow } from '@/features/cities/citiesApi';
import { cn } from '@/lib/utils';

export interface CityCardProps {
  readonly row: CityStatsRow;
  readonly onOpen: (cityId: string) => void;
  readonly className?: string;
}

export function CityCard({ row, onOpen, className }: CityCardProps) {
  const { t } = useTranslation();

  return (
    <article
      className={cn(
        'border-border-subtle bg-surface group relative flex items-center gap-3 rounded-lg border p-4',
        'duration-fast transition-[border-color,background-color,box-shadow] ease-out',
        'hover:border-border-strong hover:bg-subtle/40 hover:shadow-sm',
        'focus-within:border-border-strong',
        className,
      )}
    >
      {/* Stretched-button surface (same pattern as NoteCard) */}
      <button
        type="button"
        onClick={() => {
          onOpen(row.cityId);
        }}
        className={cn(
          'absolute inset-0 z-0 rounded-lg',
          'focus-visible:shadow-focus focus-visible:outline-none',
        )}
      >
        <span className="sr-only">{row.city}</span>
      </button>

      <div className="pointer-events-none relative z-10 min-w-0 flex-1">
        <h2 className="text-ink-primary truncate text-base font-semibold">{row.city}</h2>
        <dl className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1 text-sm">
          <Metric label="NO₂" value={row.maxNO2} nullLabel={t('states.sensorUnavailable')} />
          <Metric label="CO" value={row.maxCO} nullLabel={t('states.sensorUnavailable')} />
          <Metric label="PM₁₀" value={row.maxPM10} nullLabel={t('states.sensorUnavailable')} />
        </dl>
      </div>
      <ChevronRight
        className="text-ink-tertiary pointer-events-none relative z-10 h-4 w-4 shrink-0"
        aria-hidden="true"
      />
    </article>
  );
}

function Metric({
  label,
  value,
  nullLabel,
}: {
  readonly label: string;
  readonly value: number | null;
  readonly nullLabel: string;
}) {
  const isNull = value === null;
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-ink-tertiary text-xs uppercase tracking-wide">{label}</dt>
      <dd
        className={cn('font-mono tabular-nums', isNull ? 'text-ink-tertiary' : 'text-ink-primary')}
      >
        {isNull ? (
          <abbr title={nullLabel} className="no-underline" aria-label={nullLabel}>
            —
          </abbr>
        ) : (
          value.toFixed(2)
        )}
      </dd>
    </div>
  );
}
