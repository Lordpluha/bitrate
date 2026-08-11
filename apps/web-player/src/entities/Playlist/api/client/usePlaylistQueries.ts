'use client'

import { clientFetchClient, useQuery } from '@shared/api/client'
import { ApiRequestError, ensureOkResponse } from '@shared/api/errors'
import { useQuery as useTanStackQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { PlaylistWithTracks } from './playlist.types'
import { playlistQueryKeys, withPlayableTrackUrls } from './playlistQuery'
import { libraryPlaylistsResponseSchema } from './playlistResponse.schema'

const normalizePlaylistsResponse = (data: unknown) =>
  libraryPlaylistsResponseSchema.parse(data)

export const usePlaylists = (page = 1, limit = 20) =>
  useQuery(
    'get',
    '/api/v1/playlists',
    { params: { query: { page, limit } } },
    { retry: false, staleTime: 60_000 },
  )

export const useMyPlaylists = () =>
  useQuery(
    'get',
    '/api/v1/playlists/me',
    {},
    {
      retry: false,
      select: normalizePlaylistsResponse,
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
