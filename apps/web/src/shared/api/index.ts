'use client'

import createFetchClient from 'openapi-fetch'
import createClient from 'openapi-react-query'
import type { ApiPaths } from '@spotify/contracts'

/**
 * Fetch client for the API.
 */
export const fetchClient = createFetchClient<ApiPaths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL
})

/**
 * Query TS client for the API.
 */
export const rqClient = createClient(fetchClient)
const {
  useQuery,
  useMutation,
  useInfiniteQuery,
  queryOptions,
  useSuspenseQuery
} = rqClient
export {
  useQuery,
  useMutation,
  useInfiniteQuery,
  queryOptions,
  useSuspenseQuery
}

