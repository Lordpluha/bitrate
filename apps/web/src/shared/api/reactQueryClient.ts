'use client'

import createClient from 'openapi-react-query'

import { fetchClient } from './fetchClient'

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
