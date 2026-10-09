import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { clientFetchClient } from '@shared/api/fetchClient'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationListSchema } from '../model/notification.schema'

/** Refreshed in the background so the unread dot follows deadlines without a reload. */
const REFRESH_MS = 60_000

const key = (artistId: string) =>
  [...artistMusicKeys.artist(artistId), 'notifications'] as const

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
