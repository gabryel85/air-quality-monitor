/**
 * CityTrendChart — feature organism.
 *
 * Pollutant time-series for a single city. Shown above the notes list.
 * Fetches an Ambee-history-style series for the chosen range and draws up
 * to three toggleable lines (NO₂ / CO / PM₁₀) with a visx-built canvas.
 *
 * This is where the `24H` concept finally lands naturally: the 24h range
 * IS the most recent 24 hours and genuinely moves — unlike the dashboard
 * which is an annual snapshot.
 */

import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { scaleLinear, scaleTime } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { defaultStyles, useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { useMemo, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Badge, type BadgeVariant } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { ErrorState } from '@/components/molecules/ErrorState';
import { PollingIndicator } from '@/components/molecules/PollingIndicator';
import { setYear } from '@/features/filters/filtersSlice';
import { cn } from '@/lib/utils';
import type { AqiCategory, SeriesPointDto, SeriesRange } from '@/mocks/types';

import { useGetCitySeriesQuery } from './citySeriesApi';

/** 24h is the only genuinely live range — poll only that one. */
const POLL_INTERVAL_MS = 20_000;

type MetricKey = 'no2' | 'co' | 'pm10';

interface MetricDef {
  readonly key: MetricKey;
  readonly label: string;
  /** CSS-variable colour token — keeps the no-hex-literals rule happy. */
  readonly color: string;
}

const METRICS: readonly MetricDef[] = [
  { key: 'no2', label: 'NO₂', color: 'var(--color-chart-bar)' },
  { key: 'co', label: 'CO', color: 'var(--color-accent-secondary)' },
  { key: 'pm10', label: 'PM₁₀', color: 'var(--color-status-warning)' },
];

const RANGES: readonly SeriesRange[] = ['24h', '7d', '30d', 'year'];

const AQI_VARIANT: Record<AqiCategory, BadgeVariant> = {
  good: 'success',
  moderate: 'warning',
  unhealthySensitive: 'warning',
  unhealthy: 'error',
  veryUnhealthy: 'error',
  hazardous: 'error',
};

export interface CityTrendChartProps {
  readonly cityId: string;
  readonly className?: string;
}

export function CityTrendChart({ cityId, className }: CityTrendChartProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // The dashboard's selected year decides the mode:
  //   - current year (or none picked) → live: all ranges, 24h polls.
  //   - past year → historical: locked to that year's monthly view, no poll.
  // Relative ranges (24h/7d/30d) are "relative to now" and only make sense
  // for the current year — you can't have "the last 24h of 2024".
  const selectedYear = useAppSelector((s) => s.filters.year);
  const currentYear = new Date().getFullYear();
  const isHistorical = selectedYear !== null && selectedYear < currentYear;
  const effectiveYear = selectedYear ?? currentYear;

  const [pickedRange, setPickedRange] = useState<SeriesRange>('24h');
  const [hidden, setHidden] = useState<ReadonlySet<MetricKey>>(new Set());

  const range: SeriesRange = isHistorical ? 'year' : pickedRange;

  const { data, isLoading, isError, error, refetch, fulfilledTimeStamp } = useGetCitySeriesQuery(
    { cityId, range, year: effectiveYear },
    { pollingInterval: !isHistorical && range === '24h' ? POLL_INTERVAL_MS : 0 },
  );

  const visibleMetrics = METRICS.filter((m) => !hidden.has(m.key));

  function toggleMetric(key: MetricKey): void {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else if (METRICS.length - next.size > 1) {
        // Keep at least one series visible.
        next.add(key);
      }
      return next;
    });
  }

  const latest = data?.points.at(-1) ?? null;

  return (
    <section
      aria-labelledby="city-trend-title"
      className={cn(
        'border-border-subtle bg-surface flex flex-col gap-3 rounded-lg border p-4',
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 id="city-trend-title" className="text-ink-primary text-base font-semibold">
            {t('labels.pollutionTrend')}
          </h2>
          {latest ? (
            <Badge variant={AQI_VARIANT[latest.category]}>
              {t('aqi.label')} {latest.aqi} · {t(`aqi.${latest.category}`)}
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Same live/historical state indicator as the dashboard toolbar. */}
          <PollingIndicator
            lastUpdatedAt={fulfilledTimeStamp ?? null}
            isHistorical={isHistorical}
            isError={isError}
          />
          {isHistorical ? (
            <Button variant="secondary" size="sm" onClick={() => dispatch(setYear(currentYear))}>
              {t('actions.goToCurrentYear', { year: currentYear })}
            </Button>
          ) : (
            <RangeSelector range={pickedRange} onChange={setPickedRange} />
          )}
        </div>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {METRICS.map((m) => {
          const on = !hidden.has(m.key);
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => {
                toggleMetric(m.key);
              }}
              aria-pressed={on}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm',
                'duration-fast transition-colors ease-out',
                'focus-visible:shadow-focus focus-visible:outline-none',
                on
                  ? 'border-border-strong bg-subtle text-ink-primary'
                  : 'border-border-subtle text-ink-tertiary hover:text-ink-secondary',
              )}
            >
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: on ? m.color : 'var(--color-border-strong)' }}
              />
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="h-[260px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner size="lg" label={t('states.loading')} />
          </div>
        ) : isError ? (
          <ErrorState compact onRetry={() => void refetch()} technicalDetail={error} />
        ) : data && data.points.length > 0 ? (
          <ParentSize>
            {({ width, height }) => (
              <TrendCanvas
                points={data.points}
                range={range}
                metrics={visibleMetrics}
                width={width}
                height={height}
              />
            )}
          </ParentSize>
        ) : (
          <div className="text-ink-tertiary flex h-full items-center justify-center text-sm">
            {t('states.noData.title')}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// Range selector — segmented control
// ============================================================

function RangeSelector({
  range,
  onChange,
}: {
  readonly range: SeriesRange;
  readonly onChange: (next: SeriesRange) => void;
}) {
  const { t } = useTranslation();
  const labels: Record<SeriesRange, string> = {
    '24h': t('labels.range24h'),
    '7d': t('labels.range7d'),
    '30d': t('labels.range30d'),
    year: t('labels.rangeYear'),
  };

  return (
    <div
      role="group"
      aria-label={t('labels.pollutionTrend')}
      className="border-border bg-surface inline-flex rounded-md border p-0.5"
    >
      {RANGES.map((r) => {
        const active = r === range;
        return (
          <button
            key={r}
            type="button"
            onClick={() => {
              onChange(r);
            }}
            aria-pressed={active}
            className={cn(
              'rounded-[4px] px-2.5 py-1 text-sm font-medium',
              'duration-fast transition-colors ease-out',
              'focus-visible:shadow-focus focus-visible:outline-none',
              active
                ? 'bg-accent text-ink-on-accent'
                : 'text-ink-secondary hover:bg-subtle hover:text-ink-primary',
            )}
          >
            {labels[r]}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// Canvas — visx line chart
// ============================================================

const MARGIN = { top: 12, right: 12, bottom: 32, left: 44 };

const TOOLTIP_STYLES: CSSProperties = {
  ...defaultStyles,
  background: 'var(--color-bg-surface)',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-md)',
  fontSize: '12px',
  padding: '6px 10px',
};

interface TrendCanvasProps {
  readonly points: readonly SeriesPointDto[];
  readonly range: SeriesRange;
  readonly metrics: readonly MetricDef[];
  readonly width: number;
  readonly height: number;
}

function TrendCanvas({ points, range, metrics, width, height }: TrendCanvasProps) {
  const { t, i18n } = useTranslation();
  const { tooltipOpen, tooltipLeft, tooltipData, hideTooltip, showTooltip } = useTooltip<{
    point: SeriesPointDto;
  }>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const xScale = useMemo(() => {
    const times = points.map((p) => new Date(p.ts).getTime());
    return scaleTime<number>({
      domain: [Math.min(...times), Math.max(...times)],
      range: [0, Math.max(0, innerWidth)],
    });
  }, [points, innerWidth]);

  const yScale = useMemo(() => {
    let max = 1;
    for (const p of points) {
      for (const m of metrics) {
        const v = p[m.key];
        if (v !== null && v > max) max = v;
      }
    }
    return scaleLinear<number>({
      domain: [0, max * 1.12],
      range: [Math.max(0, innerHeight), 0],
      nice: true,
    });
  }, [points, metrics, innerHeight]);

  const timeFormatter = useMemo(() => {
    const locale = i18n.resolvedLanguage ?? 'en';
    const opts: Intl.DateTimeFormatOptions =
      range === '24h'
        ? { hour: '2-digit', minute: '2-digit' }
        : range === 'year'
          ? { month: 'short' }
          : { day: '2-digit', month: 'short' };
    return new Intl.DateTimeFormat(locale, opts);
  }, [range, i18n.resolvedLanguage]);

  if (innerWidth < 40 || innerHeight < 40) return null;

  function nearestPoint(clientX: number, svg: SVGSVGElement): SeriesPointDto | null {
    const rect = svg.getBoundingClientRect();
    const x = clientX - rect.left - MARGIN.left;
    if (points.length === 0) return null;
    const ratio = Math.min(1, Math.max(0, x / innerWidth));
    const idx = Math.round(ratio * (points.length - 1));
    return points[idx] ?? null;
  }

  return (
    <>
      <svg ref={containerRef} width={width} height={height} aria-hidden="true">
        <Group left={MARGIN.left} top={MARGIN.top}>
          {yScale.ticks(4).map((tick) => (
            <line
              key={`g-${String(tick)}`}
              x1={0}
              x2={innerWidth}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="var(--color-chart-grid)"
              strokeDasharray="2 3"
            />
          ))}

          {metrics.map((m) => (
            <path
              key={m.key}
              d={buildLinePath(
                points,
                m.key,
                (ts) => xScale(new Date(ts)),
                (v) => yScale(v),
              )}
              fill="none"
              stroke={m.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          <AxisLeft
            scale={yScale}
            numTicks={4}
            stroke="var(--color-chart-axis)"
            tickStroke="var(--color-chart-axis)"
            tickLabelProps={{
              fill: 'var(--color-chart-axis)',
              fontSize: 11,
              fontFamily: 'var(--font-family-mono)',
              dx: -4,
              textAnchor: 'end',
              dominantBaseline: 'middle',
            }}
          />
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            numTicks={Math.min(6, points.length)}
            stroke="var(--color-chart-axis)"
            tickStroke="var(--color-chart-axis)"
            tickFormat={(value) => timeFormatter.format(value as Date)}
            tickLabelProps={{
              fill: 'var(--color-chart-axis)',
              fontSize: 11,
              textAnchor: 'middle',
            }}
          />

          {/* Hover guide */}
          {tooltipOpen && tooltipData ? (
            <line
              x1={xScale(new Date(tooltipData.point.ts))}
              x2={xScale(new Date(tooltipData.point.ts))}
              y1={0}
              y2={innerHeight}
              stroke="var(--color-border-strong)"
              strokeDasharray="3 3"
            />
          ) : null}

          {/* Transparent capture layer for the tooltip */}
          <rect
            x={0}
            y={0}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onMouseMove={(e) => {
              const svg = e.currentTarget.ownerSVGElement;
              if (!svg) return;
              const point = nearestPoint(e.clientX, svg);
              if (!point) return;
              const svgRect = svg.getBoundingClientRect();
              showTooltip({
                tooltipLeft: e.clientX - svgRect.left,
                tooltipTop: e.clientY - svgRect.top,
                tooltipData: { point },
              });
            }}
            onMouseLeave={() => {
              hideTooltip();
            }}
          />
        </Group>
      </svg>

      {tooltipOpen && tooltipData ? (
        <TooltipInPortal
          top={0}
          left={tooltipLeft ?? 0}
          offsetLeft={14}
          offsetTop={14}
          style={TOOLTIP_STYLES}
        >
          <div className="text-ink-primary font-semibold">
            {new Intl.DateTimeFormat(i18n.resolvedLanguage ?? 'en', {
              dateStyle: range === '24h' ? undefined : 'medium',
              timeStyle: range === '24h' || range === '7d' ? 'short' : undefined,
            }).format(new Date(tooltipData.point.ts))}
          </div>
          <ul className="mt-1 flex flex-col gap-0.5">
            {metrics.map((m) => {
              const v = tooltipData.point[m.key];
              return (
                <li key={m.key} className="flex items-center gap-1.5 font-mono">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="text-ink-secondary">{m.label}</span>
                  <span className="text-ink-primary ml-auto">
                    {v === null ? t('states.sensorUnavailable') : v.toFixed(2)}
                  </span>
                </li>
              );
            })}
          </ul>
        </TooltipInPortal>
      ) : null}
    </>
  );
}

/** SVG path with gaps where a metric value is null. */
function buildLinePath(
  points: readonly SeriesPointDto[],
  metric: MetricKey,
  xOf: (ts: string) => number,
  yOf: (v: number) => number,
): string {
  let d = '';
  let penDown = false;
  for (const p of points) {
    const v = p[metric];
    if (v === null) {
      penDown = false;
      continue;
    }
    const cmd = penDown ? 'L' : 'M';
    d += `${cmd}${String(xOf(p.ts))},${String(yOf(v))} `;
    penDown = true;
  }
  return d.trim();
}
