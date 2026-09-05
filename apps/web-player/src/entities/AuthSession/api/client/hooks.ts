'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clientFetchClient } from '@/shared/api/client'
import { ensureOkResponse } from '@/shared/api/errors'
import { authSessionsSchema } from './session.schemas'

const AUTH_SESSIONS_QUERY_KEY = ['auth', 'sessions'] as const

export const useAuthSessions = (enabled = true) =>
  useQuery({
    queryKey: AUTH_SESSIONS_QUERY_KEY,
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/auth/sessions',
        {},
      )
      ensureOkResponse(response, 'Failed to load active sessions')
      return authSessionsSchema.parse(data)
    },
    enabled,
    staleTime: 60_000,
  })

const useRevokeSessionMutation = (revokeAllOthers: boolean) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId?: string) => {
      const { response } = revokeAllOthers
        ? await clientFetchClient.DELETE('/api/v1/auth/sessions', {})
        : await clientFetchClient.DELETE('/api/v1/auth/sessions/{id}', {
            params: { path: { id: sessionId ?? '' } },
          })

      ensureOkResponse(response, 'Failed to revoke session')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: AUTH_SESSIONS_QUERY_KEY })
    },
  })
}

export const useRevokeAuthSession = () => useRevokeSessionMutation(false)

export const useRevokeOtherAuthSessions = () => useRevokeSessionMutation(true)
