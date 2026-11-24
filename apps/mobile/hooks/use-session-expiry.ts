import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { sessionEvents } from '@/lib/api/session-events'
import { ME_QUERY_KEY } from '@/lib/auth/me-query'

/**
 * When the API reports the session as gone, mark the listener signed out (the auth guard then
 * routes to login) and drop cached private data.
 */
export function useSessionExpiry(): void {
  const queryClient = useQueryClient()

  useEffect(
    () =>
      sessionEvents.onExpired(() => {
        queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== ME_QUERY_KEY[0] })
        queryClient.setQueryData(ME_QUERY_KEY, null)
      }),
    [queryClient],
  )
}
