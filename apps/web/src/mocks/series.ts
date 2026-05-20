/**
 * City pollutant time-series generator.
 *
 * Produces an Ambee-history-style array of time-stamped points for a city
 * over a chosen range. Values are synthetic but follow real-world rhythms:
 *
 *   - Diurnal: morning (~08:00) + evening (~18:00) rush-hour peaks.
 *   - Weekly:  weekends ~18% lower (less traffic).
 *   - Seasonal: winter higher (domestic heating / inversions).
 *
 * Every point is DETERMINISTIC for a given (cityId, timestamp) — so polling
 * never makes the chart jump, and tests are stable. Only the trailing edge
 * of the 24h range moves as wall-clock time advances.
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

const RANGE_SHAPE: Record<SeriesRange, RangeShape> = {
  '24h': { count: 24, stepMs: HOUR },
  '7d': { count: 28, stepMs: 6 * HOUR },
  '30d': { count: 30, stepMs: DAY },
  year: { count: 12, stepMs: 30 * DAY },
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

export function generateSeries(cityId: string, range: SeriesRange, now: number): SeriesPointDto[] {
  const shape = RANGE_SHAPE[range];
  const points: SeriesPointDto[] = [];

  for (let i = shape.count - 1; i >= 0; i--) {
    const ts = now - i * shape.stepMs;
    const d = new Date(ts);
    const year = d.getFullYear();
    const base = getBaseValues(cityId, year);

    const factor =
      diurnalFactor(d.getHours()) * weeklyFactor(d.getDay()) * seasonalFactor(d.getMonth());

    // Deterministic ±9% jitter, unique per (city, timestamp).
    const seed = hash01(`${cityId}:${String(ts)}`);
    const jitter = 0.91 + seed * 0.18;
    const value = (v: number) => round2(v * factor * jitter);

    // Independent per-pollutant sensor-failure roll.
    const no2 = hash01(`no2:${cityId}:${String(ts)}`) < NULL_RATE ? null : value(base.no2);
    const co = hash01(`co:${cityId}:${String(ts)}`) < NULL_RATE ? null : value(base.co);
    const pm10 = hash01(`pm10:${cityId}:${String(ts)}`) < NULL_RATE ? null : value(base.pm10);

    const aqi = computeAqi(no2, pm10);
    points.push({
      ts: new Date(ts).toISOString(),
      no2,
      co,
      pm10,
      aqi,
      category: aqiCategory(aqi),
    });
  }

  return points;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
