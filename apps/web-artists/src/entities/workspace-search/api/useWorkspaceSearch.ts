import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { clientFetchClient } from '@shared/api/fetchClient'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  MIN_SEARCH_LENGTH,
  workspaceSearchSchema,
} from '../model/search.schema'

export function useWorkspaceSearch(artistId: string, query: string) {
  const q = query.trim()
  return useQuery({
    queryKey: [...artistMusicKeys.artist(artistId), 'search', q],
    queryFn: async ({ signal }) => {
      const result = await clientFetchClient.GET('/api/v1/artist-search', {
        params: { query: { q } },
        signal,
      })
      const parsed = workspaceSearchSchema.safeParse(result.data)
      if (!result.response.ok || !parsed.success)
        throw new Error('Search is unavailable right now.')
      return parsed.data
    },
    enabled: q.length >= MIN_SEARCH_LENGTH,
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  })
}
