/**
 * City pollutant time-series generator.
 *
 * Produces an Ambee-history-style array of time-stamped points for a city.
 *
 *   - 24h / 7d / 30d → windows relative to "now". Only meaningful for the
 *     current year (you can't have "the last 24h of 2024").
 *   - year           → 12 monthly points anchored to a specific calendar
 *     year. For a past year all 12 months; for the current year, only the
 *     months that have already happened.
 *
 * Values are synthetic but follow real-world rhythms:
 *   - Diurnal: morning (~08:00) + evening (~18:00) rush-hour peaks.
 *   - Weekly:  weekends ~18% lower (less traffic).
 *   - Seasonal: winter higher (domestic heating / inversions).
 *
 * Every point is DETERMINISTIC for a given (cityId, timestamp) — polling
 * never makes the chart jump, and tests are stable. Only the trailing edge
 * of the relative ranges moves as wall-clock time advances.
 */

import { getBaseValues } from './seed';
import type { AqiCategory, SeriesPointDto, SeriesRange } from './types';

interface RangeShape {
  /** Number of points. */
  count: number;
  /** Spacing between points, in milliseconds. */
  stepMs: number;
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Relative ranges only — `year` is anchored, handled separately. */
const RELATIVE_SHAPE: Record<Exclude<SeriesRange, 'year'>, RangeShape> = {
  '24h': { count: 24, stepMs: HOUR },
  '7d': { count: 28, stepMs: 6 * HOUR },
  '30d': { count: 30, stepMs: DAY },
};

/** Deterministic 0..1 hash from a string (FNV-1a). */
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/** Morning + evening rush-hour bumps; baseline 1.0 at night. */
function diurnalFactor(hour: number): number {
  const morning = 0.32 * Math.exp(-((hour - 8) ** 2) / 7);
  const evening = 0.36 * Math.exp(-((hour - 18) ** 2) / 8);
  return 1 + morning + evening;
}

/** Weekends quieter. */
function weeklyFactor(dayOfWeek: number): number {
  return dayOfWeek === 0 || dayOfWeek === 6 ? 0.82 : 1;
}

/** Winter (Jan) high, summer (Jul) low. */
function seasonalFactor(month: number): number {
  return 1 + 0.26 * Math.cos((month / 12) * 2 * Math.PI);
}

/**
 * AQI — synthetic composite. Real AQI takes the worst per-pollutant
 * sub-index; we approximate with the dominant of PM10 / NO2 on the PDF's
 * arbitrary value scale.
 */
function computeAqi(no2: number | null, pm10: number | null): number {
  const fromPm10 = pm10 !== null ? pm10 * 92 : 0;
  const fromNo2 = no2 !== null ? no2 * 1.7 : 0;
  return Math.round(Math.max(fromPm10, fromNo2));
}

export function aqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthySensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'veryUnhealthy';
  return 'hazardous';
}

const NULL_RATE = 0.03;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Build one point with independent per-pollutant sensor-failure rolls. */
function makePoint(cityId: string, ts: number, factor: number): SeriesPointDto {
  const base = getBaseValues(cityId, new Date(ts).getFullYear());
  const seed = hash01(`${cityId}:${String(ts)}`);
  const jitter = 0.91 + seed * 0.18;
  const value = (v: number) => round2(v * factor * jitter);

  const no2 = hash01(`no2:${cityId}:${String(ts)}`) < NULL_RATE ? null : value(base.no2);
  const co = hash01(`co:${cityId}:${String(ts)}`) < NULL_RATE ? null : value(base.co);
  const pm10 = hash01(`pm10:${cityId}:${String(ts)}`) < NULL_RATE ? null : value(base.pm10);

  const aqi = computeAqi(no2, pm10);
  return { ts: new Date(ts).toISOString(), no2, co, pm10, aqi, category: aqiCategory(aqi) };
}

export function generateSeries(
  cityId: string,
  range: SeriesRange,
  now: number,
  year: number,
): SeriesPointDto[] {
  if (range === 'year') return generateYearSeries(cityId, year, now);

  const shape = RELATIVE_SHAPE[range];
  const points: SeriesPointDto[] = [];
  for (let i = shape.count - 1; i >= 0; i--) {
    const ts = now - i * shape.stepMs;
    const d = new Date(ts);
    const factor =
      diurnalFactor(d.getHours()) * weeklyFactor(d.getDay()) * seasonalFactor(d.getMonth());
    points.push(makePoint(cityId, ts, factor));
  }
  return points;
}

/**
 * 12 monthly points for a calendar year. A past year gets all 12; the
 * current year is partial — only months up to the present.
 */
function generateYearSeries(cityId: string, year: number, now: number): SeriesPointDto[] {
  const nowDate = new Date(now);
  const lastMonth = year === nowDate.getFullYear() ? nowDate.getMonth() : 11;

  const points: SeriesPointDto[] = [];
  for (let m = 0; m <= lastMonth; m++) {
    // Mid-month noon — a stable anchor for the monthly aggregate.
    const ts = new Date(year, m, 15, 12, 0, 0).getTime();
    // Monthly aggregate already averages out diurnal/weekly rhythm.
    points.push(makePoint(cityId, ts, seasonalFactor(m)));
  }
  return points;
}
