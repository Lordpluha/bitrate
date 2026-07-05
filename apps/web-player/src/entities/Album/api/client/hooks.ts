'use client'

import { clientFetchClient, useMutation } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { apiQueryKeys } from '@shared/api/queryKeys'
import type { ApiSchemas } from '@spotify/contracts'
import { useQuery, useQueryClient } from '@tanstack/react-query'

type UseAlbumsParams = {
  page?: number
  limit?: number
  title?: string
}

export const useAlbums = ({
  page = 1,
  limit = 20,
  title,
}: UseAlbumsParams = {}) =>
  useQuery({
    queryKey: apiQueryKeys.albums.list({ page, limit, title }),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET('/api/v1/albums', {
        params: {
          query: {
            page,
            limit,
            ...(title ? { title } : {}),
          },
        },
      })

      ensureOkResponse(response, 'Failed to fetch albums')

      return (Array.isArray(data) ? data : []) as ApiSchemas['AlbumEntity'][]
    },
  })

export const useAlbum = (albumId?: string) =>
  useQuery({
    queryKey: apiQueryKeys.albums.detail(albumId ?? ''),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/albums/{id}',
        {
          params: {
            path: { id: albumId ?? '' },
          },
        } as never,
      )

      ensureOkResponse(response, 'Failed to fetch album')

      return data as unknown as ApiSchemas['AlbumEntity']
    },
    enabled: !!albumId,
  })

export const useLikeAlbum = () => {
  const queryClient = useQueryClient()

  return useMutation('post', '/api/v1/albums/{id}/like', {
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.albums.all }),
        queryClient.invalidateQueries({
          queryKey: apiQueryKeys.albums.detail(variables.params.path.id),
        }),
      ])
    },
  })
}

export const useUnlikeAlbum = () => {
  const queryClient = useQueryClient()

  return useMutation('delete', '/api/v1/albums/{id}/like', {
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.albums.all }),
        queryClient.invalidateQueries({
          queryKey: apiQueryKeys.albums.detail(variables.params.path.id),
        }),
      ])
    },
  })
}
