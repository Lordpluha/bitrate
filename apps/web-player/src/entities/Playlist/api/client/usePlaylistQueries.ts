'use client'

import { clientFetchClient, useQuery } from '@shared/api/client'
import { ApiRequestError, ensureOkResponse } from '@shared/api/errors'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { useQuery as useTanStackQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { PlaylistWithTracks } from './playlist.types'
import { playlistQueryKeys, withPlayableTrackUrls } from './playlistQuery'
import {
  libraryPlaylistsResponseSchema,
  likedPlaylistsPageSchema,
  normalizePlaylistsResponse,
} from './playlistResponse.schema'

const normalizeLibraryPlaylistsResponse = (data: unknown) =>
  libraryPlaylistsResponseSchema.parse(data)

/** A person's public playlists for their profile; empty when they hide them (`publicPlaylistsOnProfile`). */
export const useUserPlaylists = (userId: string) =>
  useQuery(
    'get',
    '/api/v1/playlists',
    { params: { query: { limit: 50, page: 1, userId } } },
    {
      enabled: Boolean(userId),
      retry: false,
      select: normalizePlaylistsResponse,
    },
  )

export const useMyPlaylists = () =>
  useQuery(
    'get',
    '/api/v1/playlists/me',
    {},
    {
      retry: false,
      select: normalizeLibraryPlaylistsResponse,
      staleTime: 60_000,
    },
  )

export const usePlaylist = (
  playlistId: string,
  onSuccess?: (playlist: PlaylistWithTracks) => void,
) => {
  const query = useTanStackQuery({
    enabled: Boolean(playlistId),
    gcTime: 10 * 60_000,
    meta: { suppressErrorToast: true },
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/playlists/{id}',
        { params: { path: { id: playlistId } } },
      )

      ensureOkResponse(response, 'Failed to load playlist')
      if (!data) throw new ApiRequestError('Playlist response is empty', 502)

      return withPlayableTrackUrls(data)
    },
    queryKey: playlistQueryKeys.detail(playlistId),
    staleTime: 60_000,
  })

  useEffect(() => {
    if (query.data) onSuccess?.(query.data)
  }, [onSuccess, query.data])

  return query
}

const LIKED_PLAYLISTS_PAGE_SIZE = 100

const getLikedPlaylistsPage = async (page: number) => {
  const { data, response } = await clientFetchClient.GET(
    '/api/v1/playlists/liked',
    { params: { query: { limit: LIKED_PLAYLISTS_PAGE_SIZE, page } } },
  )
  ensureOkResponse(response, 'Failed to load liked playlists')
  return likedPlaylistsPageSchema.parse(data)
}

const getAllLikedPlaylists = async () => {
  const firstPage = await getLikedPlaylistsPage(1)
  const pageCount = Math.ceil(firstPage.total / firstPage.limit)
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) =>
      getLikedPlaylistsPage(index + 2),
    ),
  )
  return [firstPage, ...remainingPages].flatMap(({ data }) => data)
}

/** Every playlist the signed-in user liked, newest like first (`GET /playlists/liked`). */
export const useLikedPlaylists = (enabled = true) =>
  useTanStackQuery({
    enabled,
    queryFn: getAllLikedPlaylists,
    queryKey: apiQueryKeys.playlists.liked,
  })
