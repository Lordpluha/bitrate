import { useMutation, useQueryClient } from '@tanstack/react-query'

import { logOut } from '@/lib/auth/log-out'
import { ME_QUERY_KEY } from '@/lib/auth/me-query'

/** Ends the session: tells the API and forgets every cached private response. */
export function useLogOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logOut,
    onSettled: () => {
      queryClient.clear()
      queryClient.setQueryData(ME_QUERY_KEY, null)
    },
  })
}
