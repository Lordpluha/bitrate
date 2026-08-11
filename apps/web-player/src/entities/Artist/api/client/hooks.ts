'use client'

import {
  artistResponseSchema,
  artistsResponseSchema,
} from '@entities/Artist/api/client/artistResponse.schema'
import { clientFetchClient, useMutation } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export type ArtistEntity = {
  id: string
  username: string
  bio: string | null
  avatar: string | null
  backgroundImage: string | null
  createdAt?: string
  updatedAt?: string
}

export type UseArtistsInput = {
  page?: number
  limit?: number
}

const ARTIST_STALE_TIME = 5 * 60_000

export const useArtists = ({ page = 1, limit = 100 }: UseArtistsInput = {}) =>
  useQuery({
    queryKey: apiQueryKeys.artists.list({ page, limit }),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/artists',
        {
          params: { query: { page, limit } },
        },
      )

      ensureOkResponse(response, 'Failed to fetch artists')

      return artistsResponseSchema.parse(data)
    },
    staleTime: ARTIST_STALE_TIME,
  })

export const useArtist = (artistId?: string) =>
  useQuery({
    queryKey: apiQueryKeys.artists.detail(artistId ?? ''),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/artists/{id}',
        { params: { path: { id: artistId ?? '' } } },
      )

      ensureOkResponse(response, 'Failed to fetch artist')

      return artistResponseSchema.parse(data)
    },
    enabled: !!artistId,
    staleTime: ARTIST_STALE_TIME,
  })

export const useRelatedArtists = (artistId?: string) =>
  useQuery({
    queryKey: apiQueryKeys.artists.related(artistId ?? ''),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/recommendations/related-artists/{artistId}',
        { params: { path: { artistId: artistId ?? '' } } },
      )

      ensureOkResponse(response, 'Failed to fetch related artists')

      return artistsResponseSchema.parse(data)
    },
    enabled: !!artistId,
    staleTime: ARTIST_STALE_TIME,
  })

/** Artists the signed-in user follows. Returns an empty list when signed out. */
export const useFollowedArtists = (enabled = true) =>
  useQuery({
    queryKey: apiQueryKeys.artists.following,
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/artists/me/following',
        {},
      )

      if (response.status === 401) return []
      ensureOkResponse(response, 'Failed to fetch followed artists')

      return artistsResponseSchema.parse(data)
    },
    enabled,
    staleTime: ARTIST_STALE_TIME,
  })

const useInvalidateArtistFollow = () => {
  const queryClient = useQueryClient()

  return async () => {
    await queryClient.invalidateQueries({
      queryKey: apiQueryKeys.artists.following,
    })
  }
}

export const useFollowArtist = () => {
  const invalidate = useInvalidateArtistFollow()

  return useMutation('post', '/api/v1/artists/{id}/follow', {
    onSuccess: invalidate,
  })
}

export const useUnfollowArtist = () => {
  const invalidate = useInvalidateArtistFollow()

  return useMutation('delete', '/api/v1/artists/{id}/follow', {
    onSuccess: invalidate,
  })
}
