import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { clientFetchClient } from '@shared/api/fetchClient'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationListSchema } from '../model/notification.schema'
import {
  type NotificationPreferences,
  notificationPreferencesSchema,
} from '../model/preferences'

/** Refreshed in the background so the unread dot follows deadlines without a reload. */
const REFRESH_MS = 60_000

const key = (artistId: string) =>
  [...artistMusicKeys.artist(artistId), 'notifications'] as const
const preferencesKey = (artistId: string) =>
  [...key(artistId), 'preferences'] as const

export function useNotifications(artistId: string) {
  return useQuery({
    queryKey: key(artistId),
    queryFn: async ({ signal }) => {
      const result = await clientFetchClient.GET(
        '/api/v1/artist-notifications',
        {
          signal,
        },
      )
      const parsed = notificationListSchema.safeParse(result.data)
      if (!result.response.ok || !parsed.success)
        throw new Error('Could not load notifications. Please try again.')
      return parsed.data
    },
    refetchInterval: REFRESH_MS,
    staleTime: 15_000,
  })
}

/** Marks everything read on the server, then refreshes the list and the unread count. */
export function useMarkNotificationsSeen(artistId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    retry: false,
    mutationFn: async () => {
      const result = await clientFetchClient
        .POST('/api/v1/artist-notifications/seen', {})
        .catch(() => undefined)
      if (!result?.response.ok) throw new Error('Could not mark as read.')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key(artistId) }),
  })
}

export function useNotificationPreferences(artistId: string) {
  return useQuery({
    queryKey: preferencesKey(artistId),
    queryFn: async ({ signal }) => {
      const result = await clientFetchClient.GET(
        '/api/v1/artist-notifications/preferences',
        { signal },
      )
      const parsed = notificationPreferencesSchema.safeParse(result.data)
      if (!result.response.ok || !parsed.success)
        throw new Error(
          'Could not load notification settings. Please try again.',
        )
      return parsed.data
    },
  })
}

/** Saves the whole preference, then refreshes the center so muted items disappear. */
export function useSaveNotificationPreferences(artistId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    retry: false,
    mutationFn: async (input: NotificationPreferences) => {
      const result = await clientFetchClient
        .PUT('/api/v1/artist-notifications/preferences', {
          body: input,
          signal: AbortSignal.timeout(30_000),
        })
        .catch(() => undefined)
      const parsed = notificationPreferencesSchema.safeParse(result?.data)
      if (!result?.response.ok || !parsed.success)
        throw new Error(
          'Could not save notification settings. Please try again.',
        )
      return parsed.data
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(preferencesKey(artistId), saved)
      return queryClient.invalidateQueries({ queryKey: key(artistId) })
    },
  })
}
