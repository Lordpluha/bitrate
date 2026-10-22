'use client'

import {
  artistResponseSchema,
  artistsPaginatedResponseSchema,
  artistsResponseSchema,
} from '@entities/Artist/api/client/artistResponse.schema'
import { clientFetchClient, useMutation } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAllPages } from '@/shared/api/fetchAllPages'

export type ArtistEntity = {
  id: string
  username: string
  bio: string | null
  avatar: string | null
  backgroundImage: string | null
  monthlyListeners: number | null
  verified: boolean
  createdAt?: string
  updatedAt?: string
}

const ARTIST_STALE_TIME = 5 * 60_000

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
const FOLLOWED_ARTISTS_PAGE_SIZE = 100

const getFollowedArtistsPage = async (page: number) => {
  const { data, response } = await clientFetchClient.GET(
    '/api/v1/artists/me/following',
    { params: { query: { limit: FOLLOWED_ARTISTS_PAGE_SIZE, page } } },
  )

  if (response.status === 401) {
    return { data: [], limit: FOLLOWED_ARTISTS_PAGE_SIZE, page, total: 0 }
  }
  ensureOkResponse(response, 'Failed to fetch followed artists')
  return artistsPaginatedResponseSchema.parse(data)
}

export const getAllFollowedArtists = () =>
  fetchAllPages({ fetchPage: getFollowedArtistsPage })

export const useFollowedArtists = (enabled = true) =>
  useQuery({
    queryKey: apiQueryKeys.artists.following,
    queryFn: getAllFollowedArtists,
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

/** Fallback for the mutation cache's error toast. */
const FOLLOW_ERROR_MESSAGE = 'Could not update follow state'

export const useFollowArtist = () => {
  const invalidate = useInvalidateArtistFollow()

  return useMutation('post', '/api/v1/artists/{id}/follow', {
    meta: { errorMessage: FOLLOW_ERROR_MESSAGE },
    onSuccess: invalidate,
  })
}

export const useUnfollowArtist = () => {
  const invalidate = useInvalidateArtistFollow()

  return useMutation('delete', '/api/v1/artists/{id}/follow', {
    meta: { errorMessage: FOLLOW_ERROR_MESSAGE },
    onSuccess: invalidate,
  })
}
