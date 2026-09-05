'use client'

import {
  albumResponseSchema,
  albumsPaginatedResponseSchema,
  albumsResponseSchema,
} from '@entities/Album/api/client/albumResponse.schema'
import { clientFetchClient, useMutation } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { useQuery, useQueryClient } from '@tanstack/react-query'

type UseAlbumsParams = {
  artistId?: string
  page?: number
  limit?: number
  title?: string
}

export const useAlbums = ({
  artistId,
  page = 1,
  limit = 20,
  title,
}: UseAlbumsParams = {}) =>
  useQuery({
    queryKey: apiQueryKeys.albums.list({ artistId, page, limit, title }),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET('/api/v1/albums', {
        params: {
          query: {
            ...(artistId ? { artistId } : {}),
            page,
            limit,
            ...(title ? { title } : {}),
          },
        },
      })

      ensureOkResponse(response, 'Failed to fetch albums')

      return albumsResponseSchema.parse(data)
    },
  })

const ARTIST_ALBUMS_PAGE_SIZE = 100

const getArtistAlbumsPage = async (artistId: string, page: number) => {
  const { data, response } = await clientFetchClient.GET('/api/v1/albums', {
    params: {
      query: { artistId, limit: ARTIST_ALBUMS_PAGE_SIZE, page },
    },
  })
  ensureOkResponse(response, 'Failed to fetch artist albums')
  return albumsPaginatedResponseSchema.parse(data)
}

export const getAllAlbumsByArtist = async (artistId: string) => {
  const firstPage = await getArtistAlbumsPage(artistId, 1)
  const pageCount = Math.ceil(firstPage.total / firstPage.limit)
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) =>
      getArtistAlbumsPage(artistId, index + 2),
    ),
  )

  return [firstPage, ...remainingPages].flatMap(({ data }) => data)
}

export const useArtistAlbums = (artistId: string) =>
  useQuery({
    queryKey: apiQueryKeys.albums.artist(artistId),
    queryFn: () => getAllAlbumsByArtist(artistId),
    enabled: Boolean(artistId),
    staleTime: 5 * 60_000,
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

      return albumResponseSchema.parse(data)
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
