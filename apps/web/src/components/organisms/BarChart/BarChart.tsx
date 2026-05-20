/**
 * BarChart — organism (visx).
 *
 * Custom-rendered bar chart for city pollutant maxima. Built on visx
 * primitives (scale, axis, tooltip, responsive) instead of a higher-level
 * chart library — gives precise control over ING brand fit and avoids
 * dragging in a heavy abstraction for ~10 bars.
 *
 * Accessibility:
 *   - SVG marked role="img" + aria-labelledby pointing at a visually-hidden
 *     <table> summary so screen readers can read the data tabularly.
 *   - Tooltip is keyboard-accessible (bars are focusable buttons).
 *
 * Null values: no bar drawn for that city, the X-axis label is still shown
 * with `—` next to it so the gap is explicit, not "missing data".
 */

import { AxisBottom, AxisLeft } from '@visx/axis';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear } from '@visx/scale';
import { defaultStyles, useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { useId, useMemo, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

export interface BarDatum {
  readonly key: string;
  readonly label: string;
  readonly value: number | null;
}

export interface BarChartProps {
  readonly data: readonly BarDatum[];
  /** Axis label shown left of the Y axis (e.g. "NO₂ max"). */
  readonly yAxisLabel?: string;
  /**
   * Height in px. Defaults to responsive heights via Tailwind:
   * 200px on `<sm`, 280px on `sm+`. Pass an explicit number to override.
   */
  readonly height?: number;
  readonly className?: string;
  /** Locale-aware value formatter (e.g. for unit suffix). */
  readonly formatValue?: (value: number) => string;
}

/** Margins for SVG axes. Tighter on narrow viewports to give bars more room. */
function getMargin(width: number): { top: number; right: number; bottom: number; left: number } {
  const narrow = width < 480;
  return {
    top: 12,
    right: 8,
    bottom: narrow ? 48 : 56,
    left: narrow ? 38 : 56,
  };
}

const TOOLTIP_STYLES: CSSProperties = {
  ...defaultStyles,
  background: 'var(--color-bg-surface)',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-md)',
  fontSize: '12px',
  fontWeight: 500,
  padding: '6px 10px',
};

export function BarChart({
  data,
  yAxisLabel,
  height,
  className,
  formatValue = (v) => v.toFixed(2),
}: BarChartProps) {
  const { t } = useTranslation();
  const summaryId = useId();

  // Visually-hidden table alternative for screen readers — generated once
  // per data change so it stays in sync.
  const summary = (
    <div id={summaryId} className="sr-only">
      <table>
        <caption>{yAxisLabel ?? t('app.title')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('labels.city')}</th>
            <th scope="col">{yAxisLabel ?? t('app.title')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <th scope="row">{d.label}</th>
              <td>{d.value === null ? t('states.sensorUnavailable') : formatValue(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <figure
      role="img"
      aria-labelledby={summaryId}
      className={cn(
        'border-border-subtle bg-surface rounded-lg border p-3',
        'overflow-hidden',
        /* Responsive default; overridden by explicit `height` prop if set */
        height === undefined && 'h-[220px] sm:h-[280px]',
        className,
      )}
      style={height !== undefined ? { height } : undefined}
    >
      {summary}
      <ParentSize>
        {({ width, height: parentHeight }) => (
          <BarChartCanvas
            data={data}
            width={width}
            height={parentHeight}
            formatValue={formatValue}
            {...(yAxisLabel !== undefined ? { yAxisLabel } : {})}
          />
        )}
      </ParentSize>
    </figure>
  );
}

interface BarChartCanvasProps extends Required<Pick<BarChartProps, 'formatValue'>> {
  readonly data: readonly BarDatum[];
  readonly width: number;
  readonly height: number;
  readonly yAxisLabel?: string;
}

interface TooltipDatum {
  readonly label: string;
  readonly value: number | null;
}

function BarChartCanvas({ data, width, height, formatValue, yAxisLabel }: BarChartCanvasProps) {
  const { t } = useTranslation();
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<TooltipDatum>();

  /**
   * Portal-rendered tooltip. `containerRef` is attached to the <svg>; the
   * top/left we pass to <TooltipInPortal> are measured relative to that
   * same element, so the tooltip lands exactly at the cursor regardless of
   * the figure's padding/border or page scroll. `detectBounds` flips it to
   * stay inside the viewport near edges.
   */
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  /** Pointer position relative to the svg container. */
  function pointerInContainer(e: React.MouseEvent<SVGElement>): { x: number; y: number } {
    const svg = e.currentTarget.ownerSVGElement ?? e.currentTarget;
    const r = svg.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  const margin = getMargin(width);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        domain: data.map((d) => d.key),
        range: [0, Math.max(0, innerWidth)],
        padding: 0.3,
      }),
    [data, innerWidth],
  );

  const maxValue = useMemo(() => {
    const values = data.map((d) => d.value).filter((v): v is number => v !== null);
    return values.length > 0 ? Math.max(...values) : 1;
  }, [data]);

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxValue * 1.1],
        range: [Math.max(0, innerHeight), 0],
        nice: true,
      }),
    [maxValue, innerHeight],
  );

  if (innerWidth < 40 || innerHeight < 40) {
    return null;
  }

  return (
    <>
      <svg ref={containerRef} width={width} height={height} aria-hidden="true">
        <Group left={margin.left} top={margin.top}>
          {/* Horizontal grid lines */}
          {yScale.ticks(4).map((tick) => (
            <line
              key={`grid-${String(tick)}`}
              x1={0}
              x2={innerWidth}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="var(--color-chart-grid)"
              strokeDasharray="2 3"
            />
          ))}

          {/* Bars */}
          {data.map((d) => {
            const barX = xScale(d.key) ?? 0;
            const barWidth = xScale.bandwidth();
            if (d.value === null) {
              return (
                <g key={d.key}>
                  <line
                    x1={barX + barWidth / 2}
                    x2={barX + barWidth / 2}
                    y1={innerHeight - 8}
                    y2={innerHeight}
                    stroke="var(--color-text-tertiary)"
                    strokeDasharray="2 2"
                  />
                </g>
              );
            }
            const barHeight = innerHeight - yScale(d.value);
            const barY = yScale(d.value);
            return (
              <rect
                key={d.key}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                rx={3}
                fill="var(--color-chart-bar)"
                className="duration-slow transition-[fill,y,height] ease-out hover:cursor-pointer"
                onMouseMove={(e) => {
                  const p = pointerInContainer(e);
                  showTooltip({
                    tooltipLeft: p.x,
                    tooltipTop: p.y,
                    tooltipData: { label: d.label, value: d.value },
                  });
                }}
                onMouseLeave={() => {
                  hideTooltip();
                }}
                onFocus={(e) => {
                  // Keyboard focus: anchor the tooltip at the bar's top-centre.
                  const svg = e.currentTarget.ownerSVGElement ?? e.currentTarget;
                  const svgRect = svg.getBoundingClientRect();
                  const barRect = e.currentTarget.getBoundingClientRect();
                  showTooltip({
                    tooltipLeft: barRect.left + barRect.width / 2 - svgRect.left,
                    tooltipTop: barRect.top - svgRect.top,
                    tooltipData: { label: d.label, value: d.value },
                  });
                }}
                onBlur={() => {
                  hideTooltip();
                }}
                tabIndex={0}
              />
            );
          })}

          {/* Axes */}
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
            {...(yAxisLabel !== undefined ? { label: yAxisLabel } : {})}
            labelProps={{
              fill: 'var(--color-text-secondary)',
              fontSize: 12,
              textAnchor: 'middle',
            }}
            labelOffset={36}
          />
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            stroke="var(--color-chart-axis)"
            tickStroke="var(--color-chart-axis)"
            tickFormat={(key) => data.find((d) => d.key === key)?.label ?? key}
            tickLabelProps={{
              fill: 'var(--color-chart-axis)',
              fontSize: 11,
              textAnchor: 'end',
              transform: 'rotate(-30) translate(-6, 0)',
            }}
          />
        </Group>
      </svg>

      {tooltipOpen && tooltipData ? (
        <TooltipInPortal
          top={tooltipTop ?? 0}
          left={tooltipLeft ?? 0}
          offsetLeft={12}
          offsetTop={12}
          style={TOOLTIP_STYLES}
        >
          <div className="text-ink-primary font-semibold">{tooltipData.label}</div>
          <div className="text-ink-secondary font-mono">
            {tooltipData.value === null
              ? t('states.sensorUnavailable')
              : formatValue(tooltipData.value)}
          </div>
        </TooltipInPortal>
      ) : null}
    </>
  );
}
