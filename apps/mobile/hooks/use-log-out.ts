import { useMutation, useQueryClient } from '@tanstack/react-query'

import { logOut } from '@/lib/auth/log-out'
import { ME_QUERY_KEY } from '@/lib/auth/me-query'
import { usePlayerStore } from '@/lib/player/player-store'

/** Ends the session: tells the API, stops playback and forgets every cached private response. */
export function useLogOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logOut,
    onSettled: () => {
      usePlayerStore.getState().stop()
      /*
       * Update the session query in place: `clear()` would detach the navigator's mounted
       * observer from it, so the app kept rendering the signed-in screens after logging out.
       */
      queryClient.setQueryData(ME_QUERY_KEY, null)
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== ME_QUERY_KEY[0] })
    },
  })
}
