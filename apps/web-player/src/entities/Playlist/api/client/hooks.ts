'use client'

import type { TrackEntity } from '@entities/Track'
import {
  clientFetchClient,
  useMutation as useOpenApiMutation,
  useQuery,
} from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { getApiUrl } from '@shared/utils/mediaUrl'
import type { ApiSchemas } from '@spotify/contracts'
import {
  useQueryClient,
  useMutation as useTanStackMutation,
} from '@tanstack/react-query'
import { useEffect } from 'react'

export type PlaylistEntity = ApiSchemas['PlaylistEntity']
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
    {},
  )

export const useMyPlaylists = () =>
  useQuery('get', '/api/v1/playlists/me', {}, {})

export const usePlaylist = (
  playlistId: string,
  onSuccess?: (playlist: PlaylistWithTracks) => void,
) => {
  const query = useQuery(
    'get',
    '/api/v1/playlists/{id}',
    {
      params: {
        path: {
          id: playlistId,
        },
      },
    },
    {
      enabled: !!playlistId,
      select: (data) => withPlayableTrackUrls(data as PlaylistWithTracks),
    },
  )

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

      return data as PlaylistEntity
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: apiQueryKeys.playlists.all,
        }),
        queryClient.invalidateQueries({
          queryKey: apiQueryKeys.playlists.mine,
        }),
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

      return data as PlaylistEntity
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.playlists.all }),
        queryClient.invalidateQueries({
          queryKey: apiQueryKeys.playlists.mine,
        }),
        queryClient.invalidateQueries({
          queryKey: apiQueryKeys.playlists.detail(variables.playlistId),
        }),
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
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.playlists.all }),
        queryClient.invalidateQueries({
          queryKey: apiQueryKeys.playlists.mine,
        }),
        queryClient.removeQueries({
          queryKey: apiQueryKeys.playlists.detail(playlistId),
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
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.playlists.all }),
        queryClient.invalidateQueries({
          queryKey: apiQueryKeys.playlists.mine,
        }),
        queryClient.invalidateQueries({
          queryKey: apiQueryKeys.playlists.detail(variables.params.path.id),
        }),
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
          queryClient.invalidateQueries({
            queryKey: apiQueryKeys.playlists.all,
          }),
          queryClient.invalidateQueries({
            queryKey: apiQueryKeys.playlists.mine,
          }),
          queryClient.invalidateQueries({
            queryKey: apiQueryKeys.playlists.detail(variables.params.path.id),
          }),
        ])
      },
    },
  )
}

export const useLikePlaylist = () => {
  const queryClient = useQueryClient()

  return useOpenApiMutation('post', '/api/v1/playlists/{id}/like', {
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.playlists.all }),
        queryClient.invalidateQueries({
          queryKey: apiQueryKeys.playlists.detail(variables.params.path.id),
        }),
      ])
    },
  })
}

export const useUnlikePlaylist = () => {
  const queryClient = useQueryClient()

  return useOpenApiMutation('delete', '/api/v1/playlists/{id}/like', {
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.playlists.all }),
        queryClient.invalidateQueries({
          queryKey: apiQueryKeys.playlists.detail(variables.params.path.id),
        }),
      ])
    },
  })
}
