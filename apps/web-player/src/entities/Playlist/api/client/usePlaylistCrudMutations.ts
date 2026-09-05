'use client'

import { clientFetchClient } from '@shared/api/client'
import { ApiRequestError, ensureOkResponse } from '@shared/api/errors'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  CreatePlaylistPayload,
  UpdatePlaylistPayload,
} from './playlist.types'
import {
  invalidateMyPlaylists,
  invalidatePlaylistDetail,
  invalidatePlaylistLists,
  playlistQueryKeys,
} from './playlistQuery'

export const useCreatePlaylist = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: CreatePlaylistPayload) => {
      const { data, response } = await clientFetchClient.POST(
        '/api/v1/playlists',
        { body: body as never },
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

  return useMutation({
    mutationFn: async ({
      playlistId,
      body,
    }: {
      playlistId: string
      body: UpdatePlaylistPayload
    }) => {
      const { data, response } = await clientFetchClient.PUT(
        '/api/v1/playlists/{id}',
        { params: { path: { id: playlistId } }, body: body as never },
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

  return useMutation({
    mutationFn: async (playlistId: string) => {
      const { response } = await clientFetchClient.DELETE(
        '/api/v1/playlists/{id}',
        { params: { path: { id: playlistId } } },
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
