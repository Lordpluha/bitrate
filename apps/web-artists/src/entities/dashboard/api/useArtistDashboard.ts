import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { clientFetchClient } from '@shared/api/fetchClient'
import { useQuery } from '@tanstack/react-query'
import { artistDashboardSchema } from '../model/dashboard.schema'

/** Lives under the artist's music scope, so any release write refreshes it. */
export function useArtistDashboard(artistId: string) {
  return useQuery({
    queryKey: [...artistMusicKeys.artist(artistId), 'dashboard'],
    queryFn: ({ signal }) => getArtistDashboard(signal),
    staleTime: 10_000,
  })
}

async function getArtistDashboard(signal: AbortSignal) {
  const result = await clientFetchClient.GET('/api/v1/artist-dashboard', {
    signal,
  })
  const parsed = artistDashboardSchema.safeParse(result.data)
  if (!result.response.ok || !parsed.success)
    throw new Error('Could not load your dashboard. Please try again.')
  return parsed.data
}
