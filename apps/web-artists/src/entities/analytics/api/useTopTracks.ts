import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { clientFetchClient } from '@shared/api/fetchClient'
import { messageKey } from '@shared/i18n'
import { useQuery } from '@tanstack/react-query'
import {
  type AnalyticsPeriod,
  topTracksPageSchema,
} from '../model/analytics.schema'

export function useTopTracks(
  artistId: string,
  days: AnalyticsPeriod,
  page: number,
) {
  return useQuery({
    queryKey: [...artistMusicKeys.artist(artistId), 'top-tracks', days, page],
    queryFn: async ({ signal }) => {
      const result = await clientFetchClient.GET(
        '/api/v1/artist-analytics/top-tracks',
        {
          params: { query: { days, page } },
          signal,
        },
      )
      const parsed = topTracksPageSchema.safeParse(result.data)
      if (!result.response.ok || !parsed.success || parsed.data.days !== days)
        throw new Error(messageKey('analytics.error.load'))
      return parsed.data
    },
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[1] === artistId &&
      previousQuery.queryKey[3] === days
        ? previous
        : undefined,
    staleTime: 60_000,
  })
}
