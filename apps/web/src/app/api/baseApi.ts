import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';

/**
 * Shared base query used by every RTK Query endpoint.
 *
 * - Targets `/api` — handled in dev + prod by MSW (no real backend).
 * - Retries up to 2 times on 5xx with exponential backoff.
 * - Does NOT retry 4xx (client errors are deterministic; retrying would be a bug).
 * - Does NOT retry network errors automatically — they bubble to RTKQ error state
 *   where UI offers a manual retry button (decision: explicit user control over
 *   silent magic).
 */

const rawBaseQuery = fetchBaseQuery({ baseUrl: '/api' });
type RawBaseQuery = typeof rawBaseQuery;

const baseQueryWithRetryImpl: RawBaseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const status = result.error.status;
    // Only retry 5xx — 4xx is permanent for this request.
    if (typeof status === 'number' && status >= 400 && status < 500) {
      retry.fail(result.error);
    }
  }

  return result;
};

export const baseQueryWithRetry = retry(baseQueryWithRetryImpl, { maxRetries: 2 });

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Countries', 'Years', 'CitiesStats', 'City', 'CitySeries', 'Notes'],
  endpoints: () => ({}),
});
