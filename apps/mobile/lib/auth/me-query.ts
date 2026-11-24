import type { ApiSchemas } from '@bitrate/contracts'
import { queryOptions } from '@tanstack/react-query'

import { api } from '@/lib/api/client'
import { ensureOk } from '@/lib/api/ensure-ok'

export type SelfUser = ApiSchemas['SelfUserEntity']

export const ME_QUERY_KEY = ['auth', 'me'] as const

/**
 * The signed-in listener, or null when there is no session. A 401 here is an answer ("signed
 * out"), not a failure — the refresh middleware has already tried to renew the session.
 */
export const meQuery = queryOptions({
  queryKey: ME_QUERY_KEY,
  queryFn: async (): Promise<SelfUser | null> => {
    const { data, response } = await api.GET('/api/v1/auth/me')
    if (response.status === 401) return null
    ensureOk(response, 'Failed to load the current user')
    return data ?? null
  },
  staleTime: 5 * 60 * 1000,
})
