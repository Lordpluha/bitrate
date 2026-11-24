import { QueryClient } from '@tanstack/react-query'

import { shouldRetryQuery } from './should-retry-query'

const ONE_MINUTE = 60 * 1000

/** The app-wide React Query cache: server state lives here, never in Zustand. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: shouldRetryQuery, staleTime: ONE_MINUTE },
    mutations: { retry: false },
  },
})
