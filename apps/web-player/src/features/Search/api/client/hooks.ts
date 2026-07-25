'use client'

import { clientFetchClient } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { useQuery } from '@tanstack/react-query'

export type WebPlayerSearchType = 'tracks' | 'albums' | 'playlists'

export type SearchTrackResult = {
  id: string
  title: string
  cover: string | null
  artistId: string
  rank: number
}

export type SearchAlbumResult = {
  id: string
  title: string
  cover: string | null
  artistId: string
  rank: number
}

export type SearchPlaylistResult = {
  id: string
  title: string
  cover: string | null
  userId: string
  isPublic: boolean
  rank: number
}

export type WebPlayerSearchResults = {
  tracks?: SearchTrackResult[]
  albums?: SearchAlbumResult[]
  playlists?: SearchPlaylistResult[]
}

type UseSearchParams = {
  query: string
  types?: WebPlayerSearchType[]
  limit?: number
}

const defaultWebPlayerSearchTypes: WebPlayerSearchType[] = [
  'tracks',
  'albums',
  'playlists',
]

export const useSearch = ({
  query,
  types = defaultWebPlayerSearchTypes,
  limit = 10,
}: UseSearchParams) =>
  useQuery({
    queryKey: apiQueryKeys.search.results({ query, types, limit }),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET('/api/v1/search', {
        params: {
          query: { q: query, types, limit },
        },
      })

      ensureOkResponse(response, 'Failed to search')

      return (data ?? {}) as WebPlayerSearchResults
    },
    enabled: query.trim().length > 0,
  })
