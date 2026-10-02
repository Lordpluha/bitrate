'use client'

import { clientFetchClient } from '@shared/api/client'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'

/** Records that the signed-in user accepted the current legal documents. */
export const useAcceptLegal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data, response } = await clientFetchClient.POST(
        '/api/v1/auth/legal/accept',
        { body: { acceptLegal: true } },
      )

      if (!response.ok || !data) {
        throw new Error('Could not record your acceptance')
      }

      return data
    },
    /** The response is the refreshed account, so the cached user stops asking at once. */
    onSuccess: (user) => {
      queryClient.setQueryData(apiQueryKeys.auth.me, user)
    },
  })
}
