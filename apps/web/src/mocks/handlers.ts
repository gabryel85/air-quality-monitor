/**
 * MSW request handlers — mock backend for the entire app.
 *
 * Chaos simulation (configurable via env, defaults to realistic):
 *   - Random delay 200-800ms on stats endpoint
 *   - 5% chance the stats endpoint returns 500 (tests retry path)
 *   - 10% chance per measurement value is null (sensor failure)
 *   - 10% chance a row is omitted entirely (station failure)
 *
 * State: notes are mutated in-memory; reload resets.
 */

import { delay, http, HttpResponse } from 'msw';

import { generateSeries } from './series';
import {
  CITIES_BY_COUNTRY,
  COUNTRIES,
  getBaseValues,
  initialNotes,
  YEARS_BY_COUNTRY,
} from './seed';
import type {
  CityDto,
  CitySeriesDto,
  CityStatsDto,
  CountryDto,
  CreateNoteInput,
  NoteDto,
  NotesPageDto,
  SeriesRange,
  UpdateNoteInput,
} from './types';

const SERIES_RANGES: ReadonlySet<SeriesRange> = new Set(['24h', '7d', '30d', 'year']);

const NOTES: NoteDto[] = initialNotes();
let nextNoteId = NOTES.reduce((max, n) => Math.max(max, n.id), 0) + 1;

const STATS_FAILURE_RATE = 0.05;
const NULL_RATE = 0.1;
const ROW_OMISSION_RATE = 0.1;
const NOTES_PAGE_SIZE = 10;

function withChance(rate: number): boolean {
  return Math.random() < rate;
}

function maybeNull(value: number): string | null {
  return withChance(NULL_RATE) ? null : value.toFixed(2);
}

function findCity(cityId: string): CityDto | undefined {
  for (const list of Object.values(CITIES_BY_COUNTRY)) {
    const found = list.find((c) => c.cityId === cityId);
    if (found) return found;
  }
  return undefined;
}

function compareNotesDescByCreated(a: NoteDto, b: NoteDto): number {
  return b.createdAt.localeCompare(a.createdAt);
}

export const handlers = [
  /* -----------------------------------------------------------
   * GET /api/countries
   * --------------------------------------------------------- */
  http.get('/api/countries', async () => {
    await delay('real');
    return HttpResponse.json<CountryDto[]>(COUNTRIES);
  }),

  /* -----------------------------------------------------------
   * GET /api/countries/:countryId/years
   * --------------------------------------------------------- */
  http.get('/api/countries/:countryId/years', async ({ params }) => {
    await delay('real');
    const countryId = String(params['countryId']);
    const years = YEARS_BY_COUNTRY[countryId];
    if (!years) {
      return HttpResponse.json({ message: 'Country not found' }, { status: 404 });
    }
    return HttpResponse.json<number[]>(years);
  }),

  /* -----------------------------------------------------------
   * GET /api/country/:countryId/cities/stats/24H?year=YYYY
   *
   * Per PDF contract; extended with cityId (decision documented in
   * INFORMATION_ARCHITECTURE.md and README).
   * --------------------------------------------------------- */
  http.get('/api/country/:countryId/cities/stats/24H', async ({ params, request }) => {
    await delay(randomDelay());

    // Simulated server error → tests retry path
    if (withChance(STATS_FAILURE_RATE)) {
      return HttpResponse.json({ message: 'Simulated upstream failure (mock)' }, { status: 503 });
    }

    const countryId = String(params['countryId']);
    const url = new URL(request.url);
    const yearParam = url.searchParams.get('year');
    const year = yearParam ? Number(yearParam) : NaN;

    const cities = CITIES_BY_COUNTRY[countryId];
    const validYears = YEARS_BY_COUNTRY[countryId];
    if (!cities || !validYears) {
      return HttpResponse.json({ message: 'Country not found' }, { status: 404 });
    }
    if (!Number.isFinite(year) || !validYears.includes(year)) {
      return HttpResponse.json({ message: 'Invalid or unsupported year' }, { status: 400 });
    }

    const rows: CityStatsDto[] = cities
      .filter(() => !withChance(ROW_OMISSION_RATE))
      .map((c) => {
        const v = getBaseValues(c.cityId, year);
        return {
          cityId: c.cityId,
          city: c.city,
          maxNO2: maybeNull(v.no2),
          maxCO: maybeNull(v.co),
          maxPM10: maybeNull(v.pm10),
        };
      });

    return HttpResponse.json<CityStatsDto[]>(rows);
  }),

  /* -----------------------------------------------------------
   * GET /api/cities/:cityId
   * --------------------------------------------------------- */
  http.get('/api/cities/:cityId', async ({ params }) => {
    await delay('real');
    const city = findCity(String(params['cityId']));
    if (!city) return HttpResponse.json({ message: 'City not found' }, { status: 404 });
    return HttpResponse.json<CityDto>(city);
  }),

  /* -----------------------------------------------------------
   * GET /api/cities/:cityId/series?range=24h|7d|30d|year&year=YYYY
   *
   * Pollutant time-series, Ambee-history-style. Range governs the
   * point count + spacing; `year` anchors the `year` range to a
   * specific calendar year (ignored by the relative ranges).
   * --------------------------------------------------------- */
  http.get('/api/cities/:cityId/series', async ({ params, request }) => {
    await delay(randomDelay());

    const cityId = String(params['cityId']);
    const city = findCity(cityId);
    if (!city) return HttpResponse.json({ message: 'City not found' }, { status: 404 });

    const url = new URL(request.url);
    const rangeRaw = url.searchParams.get('range') ?? '24h';
    if (!SERIES_RANGES.has(rangeRaw as SeriesRange)) {
      return HttpResponse.json({ message: 'Invalid range' }, { status: 400 });
    }
    const range = rangeRaw as SeriesRange;

    const yearRaw = url.searchParams.get('year');
    const parsedYear = yearRaw !== null ? Number(yearRaw) : NaN;
    const year = Number.isInteger(parsedYear) ? parsedYear : new Date().getFullYear();

    return HttpResponse.json<CitySeriesDto>({
      cityId: city.cityId,
      city: city.city,
      countryId: city.countryId,
      range,
      points: generateSeries(cityId, range, Date.now(), year),
    });
  }),

  /* -----------------------------------------------------------
   * GET /api/cities/:cityId/notes?cursor=...
   * Cursor-based pagination (cursor = stringified ISO date of the
   * last item from the previous page).
   * --------------------------------------------------------- */
  http.get('/api/cities/:cityId/notes', async ({ params, request }) => {
    await delay('real');
    const cityId = String(params['cityId']);
    const cursor = new URL(request.url).searchParams.get('cursor');

    const all = NOTES.filter((n) => n.cityId === cityId).sort(compareNotesDescByCreated);
    const startIndex = cursor ? all.findIndex((n) => n.createdAt < cursor) : 0;
    const slice = startIndex === -1 ? [] : all.slice(startIndex, startIndex + NOTES_PAGE_SIZE);
    const next = slice.length === NOTES_PAGE_SIZE ? (slice.at(-1)?.createdAt ?? null) : null;

    return HttpResponse.json<NotesPageDto>({ items: slice, nextCursor: next });
  }),

  /* -----------------------------------------------------------
   * GET /api/cities/:cityId/notes/:noteId
   * --------------------------------------------------------- */
  http.get('/api/cities/:cityId/notes/:noteId', async ({ params }) => {
    await delay('real');
    const noteId = Number(params['noteId']);
    const note = NOTES.find((n) => n.id === noteId && n.cityId === params['cityId']);
    if (!note) return HttpResponse.json({ message: 'Note not found' }, { status: 404 });
    return HttpResponse.json<NoteDto>(note);
  }),

  /* -----------------------------------------------------------
   * POST /api/cities/:cityId/notes
   * --------------------------------------------------------- */
  http.post('/api/cities/:cityId/notes', async ({ params, request }) => {
    await delay(randomDelay());

    const cityId = String(params['cityId']);
    if (!findCity(cityId)) {
      return HttpResponse.json({ message: 'City not found' }, { status: 404 });
    }

    const body = (await request.json()) as CreateNoteInput;
    if (!body.title || body.title.trim().length < 3) {
      return HttpResponse.json({ message: 'Title too short' }, { status: 400 });
    }
    if (!body.content || body.content.trim().length < 1) {
      return HttpResponse.json({ message: 'Content required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const note: NoteDto = {
      id: nextNoteId++,
      cityId,
      title: body.title.trim(),
      content: body.content.trim(),
      createdAt: now,
      updatedAt: now,
    };
    NOTES.push(note);
    return HttpResponse.json<NoteDto>(note, { status: 201 });
  }),

  /* -----------------------------------------------------------
   * PATCH /api/cities/:cityId/notes/:noteId
   * Only `content` is editable per spec.
   * --------------------------------------------------------- */
  http.patch('/api/cities/:cityId/notes/:noteId', async ({ params, request }) => {
    await delay(randomDelay());

    const noteId = Number(params['noteId']);
    const note = NOTES.find((n) => n.id === noteId && n.cityId === params['cityId']);
    if (!note) return HttpResponse.json({ message: 'Note not found' }, { status: 404 });

    const body = (await request.json()) as UpdateNoteInput;
    if (!body.content || body.content.trim().length < 1) {
      return HttpResponse.json({ message: 'Content required' }, { status: 400 });
    }

    note.content = body.content.trim();
    note.updatedAt = new Date().toISOString();
    return HttpResponse.json<NoteDto>(note);
  }),
];

function randomDelay(): number {
  return 200 + Math.floor(Math.random() * 600);
}
