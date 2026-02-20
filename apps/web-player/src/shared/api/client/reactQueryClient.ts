'use client'

import createClient from 'openapi-react-query'

import { clientFetchClient } from './fetchClient'

export const rqClient = createClient(clientFetchClient)
const {
  useQuery,
  useMutation,
  useInfiniteQuery,
  queryOptions,
  useSuspenseQuery,
} = rqClient
export {
  useQuery,
  useMutation,
  useInfiniteQuery,
  queryOptions,
  useSuspenseQuery,
}
