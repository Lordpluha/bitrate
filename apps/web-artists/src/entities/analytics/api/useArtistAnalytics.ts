import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { clientFetchClient } from '@shared/api/fetchClient'
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
        throw new Error('Could not load analytics. Please try again.')
      return parsed.data
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}
