import { baseApi } from '@/app/api/baseApi';
import type { CountryDto } from '@/mocks/types';

export const countriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCountries: build.query<CountryDto[], void>({
      query: () => '/countries',
      providesTags: [{ type: 'Countries', id: 'LIST' }],
    }),
    getYears: build.query<number[], string>({
      query: (countryId) => `/countries/${encodeURIComponent(countryId)}/years`,
      providesTags: (_result, _err, countryId) => [{ type: 'Years', id: countryId }],
    }),
  }),
});

export const { useGetCountriesQuery, useGetYearsQuery } = countriesApi;
