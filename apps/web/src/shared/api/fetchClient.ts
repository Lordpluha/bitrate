import type { ApiPaths } from '@spotify/contracts';
import createFetchClient from 'openapi-fetch';

/**
 * Fetch client for the API.
 */
export const fetchClient = createFetchClient<ApiPaths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
});
