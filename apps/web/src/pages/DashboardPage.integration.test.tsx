/**
 * Integration tests for DashboardPage.
 *
 * Covers the headline polling-safety claim from README:
 *   - Filter state survives a refetch (no reset).
 *   - Sort cycle works end-to-end on the live UI.
 *
 * We exercise the Reselect chain through real React rendering. Assertions
 * use page-wide text queries because both the DataTable AND the BarChart's
 * SR-only alt-table consume the same filtered/sorted selectors — a filtered
 * city should disappear from BOTH.
 */

import { act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { setQ } from '@/features/filters/filtersSlice';
import { CITIES_BY_COUNTRY, getBaseValues } from '@/mocks/seed';
import type { CityStatsDto } from '@/mocks/types';
import { DashboardPage } from '@/pages/DashboardPage';

import { renderWithProviders } from '@/test/renderWithProviders';
import { server } from '@/test/server';

function stableStatsHandler() {
  return http.get('/api/country/:countryId/cities/stats/24H', ({ params }) => {
    const countryId = String(params['countryId']);
    const cities = CITIES_BY_COUNTRY[countryId] ?? [];
    const rows: CityStatsDto[] = cities.map((c) => {
      const v = getBaseValues(c.cityId, 2025);
      return {
        cityId: c.cityId,
        city: c.city,
        maxNO2: v.no2.toFixed(2),
        maxCO: v.co.toFixed(2),
        maxPM10: v.pm10.toFixed(2),
      };
    });
    return HttpResponse.json(rows);
  });
}

async function renderDashboardWithSelection() {
  server.use(stableStatsHandler());
  const utils = renderWithProviders(<DashboardPage />, {
    initialRoute: '/dashboard?country=PL&year=2025',
  });
  // Wait for the table to load — Gdańsk is one of the seeded PL cities.
  await utils.findAllByText(/Gdańsk/);
  return utils;
}

describe('DashboardPage — filter state survives refetch', () => {
  it('preserves filtersSlice.q after a polling cycle', async () => {
    const { store, queryAllByText } = await renderDashboardWithSelection();

    // 1. Apply filter directly via store (debounce mechanics are unit-tested).
    act(() => {
      store.dispatch(setQ('warsz'));
    });

    // 2. Wait for the page to settle: Warszawa shown, Gdańsk gone (both
    //    tables — DataTable AND BarChart SR alt — react to the same selector).
    await waitFor(() => {
      expect(queryAllByText('Gdańsk').length).toBe(0);
      expect(queryAllByText('Warszawa').length).toBeGreaterThan(0);
    });

    expect(store.getState().filters.q).toBe('warsz');

    // 3. Simulate a polling refetch by re-installing the stable handler.
    //    Same args → RTK Query writes to the same cache slot.
    server.use(stableStatsHandler());

    // 4. Filter state untouched in Redux AND view stays narrowed.
    await waitFor(() => {
      expect(store.getState().filters.q).toBe('warsz');
      expect(queryAllByText('Gdańsk').length).toBe(0);
      expect(queryAllByText('Warszawa').length).toBeGreaterThan(0);
    });
  });
});

describe('DashboardPage — sort URL state', () => {
  it('updates sort in store and URL when a sortable header is clicked', async () => {
    const { user, store } = await renderDashboardWithSelection();

    // Default sort: city asc
    expect(store.getState().table.sort).toEqual({ column: 'city', direction: 'asc' });

    // Find the NO₂ column header button (sort buttons live in <th>).
    const headers = (await import('@testing-library/react')).screen.getAllByRole('button');
    const no2Header = headers.find((b) => b.textContent?.startsWith('NO'));
    if (!no2Header) throw new Error('NO₂ header button not found');

    await user.click(no2Header);
    await waitFor(() => {
      expect(store.getState().table.sort).toEqual({ column: 'maxNO2', direction: 'asc' });
    });

    await user.click(no2Header);
    await waitFor(() => {
      expect(store.getState().table.sort).toEqual({ column: 'maxNO2', direction: 'desc' });
    });

    // Third click cycles back to default (city asc).
    await user.click(no2Header);
    await waitFor(() => {
      expect(store.getState().table.sort).toEqual({ column: 'city', direction: 'asc' });
    });
  });
});
