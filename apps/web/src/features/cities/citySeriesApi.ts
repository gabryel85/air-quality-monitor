import { baseApi } from '@/app/api/baseApi';
import type { CitySeriesDto, SeriesPointDto, SeriesRange } from '@/mocks/types';

export type { SeriesPointDto, SeriesRange } from '@/mocks/types';

export interface CitySeriesArg {
  readonly cityId: string;
  readonly range: SeriesRange;
}

export const citySeriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCitySeries: build.query<CitySeriesDto, CitySeriesArg>({
      query: ({ cityId, range }) => `/cities/${encodeURIComponent(cityId)}/series?range=${range}`,
      providesTags: (_result, _err, { cityId, range }) => [
        { type: 'CitySeries', id: `${cityId}:${range}` },
      ],
    }),
  }),
});

export const { useGetCitySeriesQuery } = citySeriesApi;

export type { CitySeriesDto };
export type CitySeriesPoint = SeriesPointDto;
