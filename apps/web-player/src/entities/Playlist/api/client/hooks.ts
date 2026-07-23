'use client'

import { playlistsResponseSchema } from '@entities/Playlist/api/client/playlistResponse.schema'
import {
  clientFetchClient,
  queryOptions,
  useMutation as useOpenApiMutation,
  useQuery,
} from '@shared/api/client'
import { ApiRequestError, ensureOkResponse } from '@shared/api/errors'
import { getApiUrl } from '@shared/utils/mediaUrl'
import type { ApiSchemas } from '@spotify/contracts'
import {
  useQueryClient,
  useMutation as useTanStackMutation,
  useQuery as useTanStackQuery,
} from '@tanstack/react-query'
import { useEffect } from 'react'

export type PlaylistEntity = ApiSchemas['PlaylistEntity']
type TrackEntity = ApiSchemas['TrackEntity']
export type PlaylistWithTracks = PlaylistEntity & {
  tracks: TrackEntity[]
  user?: {
    id?: string
    username?: string
    avatar?: string | null
  }
}

export type CreatePlaylistPayload = {
  title: string
  description?: string
  isPublic?: boolean
}

export type UpdatePlaylistPayload = {
  title: string
  description?: string
}

const normalizePlaylistsResponse = (data: unknown) =>
  playlistsResponseSchema.parse(data)

const withPlayableTrackUrls = <T extends { tracks?: TrackEntity[] }>(
  playlist: T,
) => ({
  ...playlist,
  tracks:
    playlist.tracks?.map((track) => ({
      ...track,
      audioUrl: getApiUrl(`/api/v1/tracks/stream/${track.id}`),
    })) ?? [],
})

const playlistQueryKeys = {
  lists: ['get', '/api/v1/playlists'] as const,
  mine: () => queryOptions('get', '/api/v1/playlists/me', {}).queryKey,
  detail: (playlistId: string) =>
    queryOptions('get', '/api/v1/playlists/{id}', {
      params: { path: { id: playlistId } },
    }).queryKey,
}

const invalidatePlaylistLists = (
  queryClient: ReturnType<typeof useQueryClient>,
) => queryClient.invalidateQueries({ queryKey: playlistQueryKeys.lists })

const invalidateMyPlaylists = (
  queryClient: ReturnType<typeof useQueryClient>,
) => queryClient.invalidateQueries({ queryKey: playlistQueryKeys.mine() })

const invalidatePlaylistDetail = (
  queryClient: ReturnType<typeof useQueryClient>,
  playlistId: string,
) =>
  queryClient.invalidateQueries({
    queryKey: playlistQueryKeys.detail(playlistId),
  })

export const usePlaylists = (page = 1, limit = 20) =>
  useQuery(
    'get',
    '/api/v1/playlists',
    {
      params: {
        query: {
          page,
          limit,
        },
      },
    },
    {
      retry: false,
      staleTime: 60_000,
    },
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
    meta: {
      suppressErrorToast: true,
    },
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/playlists/{id}',
        {
          params: {
            path: { id: playlistId },
          },
        },
      )

      ensureOkResponse(response, 'Failed to load playlist')

      if (!data) {
        throw new ApiRequestError('Playlist response is empty', 502)
      }

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

export const useCreatePlaylist = () => {
  const queryClient = useQueryClient()

  return useTanStackMutation({
    mutationFn: async (body: CreatePlaylistPayload) => {
      const { data, response } = await clientFetchClient.POST(
        '/api/v1/playlists',
        {
          body: body as never,
        },
      )

      ensureOkResponse(response, 'Failed to create playlist')

      if (!data) {
        throw new ApiRequestError('Create playlist response is empty', 502)
      }

      return data
    },
    onSuccess: async () => {
      await Promise.all([
        invalidatePlaylistLists(queryClient),
        invalidateMyPlaylists(queryClient),
      ])
    },
  })
}

export const useUpdatePlaylist = () => {
  const queryClient = useQueryClient()

  return useTanStackMutation({
    mutationFn: async ({
      playlistId,
      body,
    }: {
      playlistId: string
      body: UpdatePlaylistPayload
    }) => {
      const { data, response } = await clientFetchClient.PUT(
        '/api/v1/playlists/{id}',
        {
          params: {
            path: { id: playlistId },
          },
          body: body as never,
        },
      )

      ensureOkResponse(response, 'Failed to update playlist')

      if (!data) {
        throw new ApiRequestError('Update playlist response is empty', 502)
      }

      return data
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        invalidatePlaylistLists(queryClient),
        invalidateMyPlaylists(queryClient),
        invalidatePlaylistDetail(queryClient, variables.playlistId),
      ])
    },
  })
}

export const useDeletePlaylist = () => {
  const queryClient = useQueryClient()

  return useTanStackMutation({
    mutationFn: async (playlistId: string) => {
      const { response } = await clientFetchClient.DELETE(
        '/api/v1/playlists/{id}',
        {
          params: {
            path: { id: playlistId },
          },
        },
      )

      ensureOkResponse(response, 'Failed to delete playlist')
    },
    onSuccess: async (_data, playlistId) => {
      await Promise.all([
        invalidatePlaylistLists(queryClient),
        invalidateMyPlaylists(queryClient),
        queryClient.removeQueries({
          queryKey: playlistQueryKeys.detail(playlistId),
        }),
      ])
    },
  })
}

export const useAddTracksToPlaylist = () => {
  const queryClient = useQueryClient()

  return useOpenApiMutation('post', '/api/v1/playlists/{id}/tracks', {
    onSuccess: async (_data, variables) => {
      await Promise.all([
        invalidateMyPlaylists(queryClient),
        invalidatePlaylistDetail(queryClient, variables.params.path.id),
      ])
    },
  })
}

export const useRemoveTrackFromPlaylist = () => {
  const queryClient = useQueryClient()

  return useOpenApiMutation(
    'delete',
    '/api/v1/playlists/{id}/tracks/{trackId}',
    {
      onSuccess: async (_data, variables) => {
        await Promise.all([
          invalidateMyPlaylists(queryClient),
          invalidatePlaylistDetail(queryClient, variables.params.path.id),
        ])
      },
    },
  )
}

export const useLikePlaylist = () => {
  const queryClient = useQueryClient()

  return useOpenApiMutation('post', '/api/v1/playlists/{id}/like', {
    onSuccess: async (_data, variables) => {
      await invalidatePlaylistDetail(queryClient, variables.params.path.id)
    },
  })
}

export const useUnlikePlaylist = () => {
  const queryClient = useQueryClient()

  return useOpenApiMutation('delete', '/api/v1/playlists/{id}/like', {
    onSuccess: async (_data, variables) => {
      await invalidatePlaylistDetail(queryClient, variables.params.path.id)
    },
  })
}
