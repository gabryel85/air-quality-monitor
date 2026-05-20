import { baseApi } from '@/app/api/baseApi';
import type { CitySeriesDto, SeriesPointDto, SeriesRange } from '@/mocks/types';

export type { SeriesPointDto, SeriesRange } from '@/mocks/types';

export interface CitySeriesArg {
  readonly cityId: string;
  readonly range: SeriesRange;
  /** Calendar year — only meaningful for the `year` range. */
  readonly year: number;
}

export const citySeriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCitySeries: build.query<CitySeriesDto, CitySeriesArg>({
      query: ({ cityId, range, year }) =>
        `/cities/${encodeURIComponent(cityId)}/series?range=${range}&year=${String(year)}`,
      providesTags: (_result, _err, { cityId, range, year }) => [
        { type: 'CitySeries', id: `${cityId}:${range}:${String(year)}` },
      ],
    }),
  }),
});

export const { useGetCitySeriesQuery } = citySeriesApi;

export type { CitySeriesDto };
export type CitySeriesPoint = SeriesPointDto;
