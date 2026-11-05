import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { clientFetchClient } from '@shared/api/fetchClient'
import { messageKey } from '@shared/i18n'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  type AnalyticsPeriod,
  artistAnalyticsSchema,
} from '../model/analytics.schema'

export function useArtistAnalytics(artistId: string, days: AnalyticsPeriod) {
  return useQuery({
    queryKey: [...artistMusicKeys.artist(artistId), 'analytics', days],
    queryFn: async ({ signal }) => {
      const result = await clientFetchClient.GET('/api/v1/artist-analytics', {
        params: { query: { days } },
        signal,
      })
      const parsed = artistAnalyticsSchema.safeParse(result.data)
      if (!result.response.ok || !parsed.success)
        throw new Error(messageKey('analytics.error.load'))
      return parsed.data
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}
