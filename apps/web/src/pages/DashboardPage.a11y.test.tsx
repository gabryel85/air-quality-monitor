/**
 * Automated a11y assertion: axe-core against the rendered DashboardPage with
 * realistic data loaded. Catches missing ARIA, contrast issues, role misuse,
 * and ~50 other categories. Complements the jsx-a11y ESLint rule (static
 * source check) with a runtime DOM audit.
 */

import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

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

describe('a11y — DashboardPage', () => {
  it('has no axe violations with loaded data', async () => {
    server.use(stableStatsHandler());
    const { container, findAllByText } = renderWithProviders(<DashboardPage />, {
      initialRoute: '/dashboard?country=PL&year=2025',
    });

    // Wait for data to render so we audit the full page, not the skeleton.
    await findAllByText(/Gdańsk/);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations in the empty state', async () => {
    const { container, findByRole } = renderWithProviders(<DashboardPage />, {
      initialRoute: '/dashboard',
    });

    // Heading is the most reliable landmark for "page rendered".
    await findByRole('heading', { name: /Monitor jakości|Air Quality/ });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
