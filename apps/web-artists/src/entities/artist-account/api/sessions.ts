import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { clientFetchClient } from '@shared/api/fetchClient'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { artistSessionSchema } from '../model/session'

const WRITE_TIMEOUT_MS = 30_000
const signal = () => AbortSignal.timeout(WRITE_TIMEOUT_MS)

const sessionKeys = {
  all: (artistId: string) =>
    [...artistMusicKeys.artist(artistId), 'sessions'] as const,
}

const sessionListSchema = z.array(artistSessionSchema)
const revokedSchema = z.object({ revoked: z.number().int().min(0) })

/** Devices signed in to this account, most recently used first. */
export function useArtistSessions(artistId: string) {
  return useQuery({
    queryKey: sessionKeys.all(artistId),
    queryFn: async ({ signal: abort }) => {
      const result = await clientFetchClient.GET(
        '/api/v1/artists/auth/sessions',
        {
          signal: abort,
        },
      )
      const parsed = sessionListSchema.safeParse(result.data)
      if (!result.response.ok || !parsed.success)
        throw new Error(
          'Could not load your signed-in devices. Please try again.',
        )
      return parsed.data
    },
    staleTime: 0,
  })
}

/** Signs out one other device; the current one ends through sign-out instead. */
export function useRevokeSession(artistId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    retry: false,
    mutationFn: async (id: string) => {
      const result = await clientFetchClient
        .DELETE('/api/v1/artists/auth/sessions/{id}', {
          params: { path: { id } },
          signal: signal(),
        })
        .catch(() => undefined)
      if (!result)
        throw new Error(
          'Could not confirm the sign-out. Reload to check the list.',
        )
      // Already gone elsewhere is the outcome the artist asked for.
      if (result.response.status === 404) return
      if (result.response.status === 409)
        throw new Error('That is this device. Use Sign out to end it.')
      if (!result.response.ok)
        throw new Error('Could not sign out that device. Please try again.')
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: sessionKeys.all(artistId) }),
  })
}

/** Signs out every device except the one in use. */
export function useRevokeOtherSessions(artistId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    retry: false,
    mutationFn: async () => {
      const result = await clientFetchClient
        .POST('/api/v1/artists/auth/sessions/revoke-others', {
          signal: signal(),
        })
        .catch(() => undefined)
      const parsed = revokedSchema.safeParse(result?.data)
      if (!result?.response.ok || !parsed.success)
        throw new Error(
          'Could not sign out the other devices. Please try again.',
        )
      return parsed.data.revoked
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: sessionKeys.all(artistId) }),
  })
}
