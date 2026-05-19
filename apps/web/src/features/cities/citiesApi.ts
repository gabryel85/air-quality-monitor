import { baseApi } from '@/app/api/baseApi';
import type { CityDto, CityStatsDto } from '@/mocks/types';

export interface CityStatsArg {
  readonly countryId: string;
  readonly year: number;
}

/**
 * Per-city statistics with stringified decimals (null on sensor failure).
 * Parsed to numeric at the selector layer; see selectors.ts.
 */
export interface CityStatsRow {
  readonly cityId: string;
  readonly city: string;
  readonly maxNO2: number | null;
  readonly maxCO: number | null;
  readonly maxPM10: number | null;
}

function parseRow(dto: CityStatsDto): CityStatsRow {
  return {
    cityId: dto.cityId,
    city: dto.city,
    maxNO2: dto.maxNO2 !== null ? Number(dto.maxNO2) : null,
    maxCO: dto.maxCO !== null ? Number(dto.maxCO) : null,
    maxPM10: dto.maxPM10 !== null ? Number(dto.maxPM10) : null,
  };
}

export const citiesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCitiesStats: build.query<CityStatsRow[], CityStatsArg>({
      query: ({ countryId, year }) =>
        `/country/${encodeURIComponent(countryId)}/cities/stats/24H?year=${String(year)}`,
      transformResponse: (response: CityStatsDto[]) => response.map(parseRow),
      providesTags: (_result, _err, { countryId, year }) => [
        { type: 'CitiesStats', id: `${countryId}:${String(year)}` },
      ],
    }),
    getCity: build.query<CityDto, string>({
      query: (cityId) => `/cities/${encodeURIComponent(cityId)}`,
      providesTags: (_result, _err, cityId) => [{ type: 'City', id: cityId }],
    }),
  }),
});

export const { useGetCitiesStatsQuery, useGetCityQuery } = citiesApi;
