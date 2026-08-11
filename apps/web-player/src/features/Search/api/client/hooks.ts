'use client'

import { clientFetchClient } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  type SearchResult,
  searchHistorySchema,
  searchResponseSchema,
} from './search.schemas'

export type WebPlayerSearchType = 'tracks' | 'artists' | 'albums' | 'playlists'

export type SearchArtistResult = {
  id: string
  username: string
  avatar: string | null
  bio: string | null
  rank: number
}

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
  albums: SearchAlbumResult[]
  artists: SearchArtistResult[]
  limit: number
  page: number
  playlists: SearchPlaylistResult[]
  topResult: SearchResult | null
  total: number
  tracks: SearchTrackResult[]
}

type UseSearchParams = {
  query: string
  types?: WebPlayerSearchType[]
  limit?: number
}

const defaultWebPlayerSearchTypes: WebPlayerSearchType[] = [
  'tracks',
  'artists',
  'albums',
  'playlists',
]

const normalizeSearchResponse = (
  input: ReturnType<typeof searchResponseSchema.parse>,
): WebPlayerSearchResults => ({
  albums: input.data.albums.map((album) => ({
    artistId: album.subtitle ?? '',
    cover: album.image,
    id: album.id,
    rank: album.rank,
    title: album.title,
  })),
  artists: input.data.artists.map((artist) => ({
    avatar: artist.image,
    bio: artist.subtitle,
    id: artist.id,
    rank: artist.rank,
    username: artist.title,
  })),
  limit: input.limit,
  page: input.page,
  playlists: input.data.playlists.map((playlist) => ({
    cover: playlist.image,
    id: playlist.id,
    isPublic: true,
    rank: playlist.rank,
    title: playlist.title,
    userId: playlist.subtitle ?? '',
  })),
  topResult: input.topResult,
  total: input.total,
  tracks: input.data.tracks.map((track) => ({
    artistId: track.subtitle ?? '',
    cover: track.image,
    id: track.id,
    rank: track.rank,
    title: track.title,
  })),
})

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

      return normalizeSearchResponse(searchResponseSchema.parse(data))
    },
    enabled: query.trim().length > 0,
    staleTime: 30 * 1000,
  })

export const useSearchHistory = (page = 1, limit = 10, enabled = true) =>
  useQuery({
    queryKey: apiQueryKeys.search.history(page, limit),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/search/history',
        { params: { query: { limit, page } } },
      )
      ensureOkResponse(response, 'Failed to load search history')
      return searchHistorySchema.parse(data)
    },
    enabled,
    staleTime: 60 * 1000,
  })

export const useClearSearchHistory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { response } = await clientFetchClient.DELETE(
        '/api/v1/search/history',
      )
      ensureOkResponse(response, 'Failed to clear search history')
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.search.all }),
  })
}
