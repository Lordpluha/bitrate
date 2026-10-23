'use client'

import {
  albumResponseSchema,
  albumsPaginatedResponseSchema,
} from '@entities/Album/api/client/albumResponse.schema'
import { clientFetchClient, useMutation } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAllPages } from '@/shared/api/fetchAllPages'

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

export const getAllAlbumsByArtist = (artistId: string) =>
  fetchAllPages({ fetchPage: (page) => getArtistAlbumsPage(artistId, page) })

export const useArtistAlbums = (artistId: string) =>
  useQuery({
    queryKey: apiQueryKeys.albums.artist(artistId),
    queryFn: () => getAllAlbumsByArtist(artistId),
    enabled: Boolean(artistId),
    staleTime: 5 * 60_000,
  })

const LIKED_ALBUMS_PAGE_SIZE = 100

const getLikedAlbumsPage = async (page: number) => {
  const { data, response } = await clientFetchClient.GET(
    '/api/v1/albums/liked',
    { params: { query: { limit: LIKED_ALBUMS_PAGE_SIZE, page } } },
  )
  ensureOkResponse(response, 'Failed to load saved albums')
  return albumsPaginatedResponseSchema.parse(data)
}

const getAllLikedAlbums = () => fetchAllPages({ fetchPage: getLikedAlbumsPage })

/**
 * Every album the signed-in user saved, newest first (`GET /albums/liked`). Lives under
 * `albums.all`, so a like or unlike refreshes it.
 */
export const useLikedAlbums = (enabled = true) =>
  useQuery({
    enabled,
    queryFn: getAllLikedAlbums,
    queryKey: apiQueryKeys.albums.liked,
  })

/** The album with its tracks; shared by the album page and "play this album" actions. */
export const albumDetailQuery = (albumId: string) =>
  queryOptions({
    queryKey: apiQueryKeys.albums.detail(albumId),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/albums/{id}',
        {
          params: {
            path: { id: albumId },
          },
        } as never,
      )

      ensureOkResponse(response, 'Failed to fetch album')

      return albumResponseSchema.parse(data)
    },
  })

export const useAlbum = (albumId?: string) =>
  useQuery({ ...albumDetailQuery(albumId ?? ''), enabled: !!albumId })

/** Fallback for the mutation cache's error toast. */
const LIBRARY_ERROR_MESSAGE = 'Could not update your library'

export const useLikeAlbum = () => {
  const queryClient = useQueryClient()

  return useMutation('post', '/api/v1/albums/{id}/like', {
    meta: { errorMessage: LIBRARY_ERROR_MESSAGE },
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
    meta: { errorMessage: LIBRARY_ERROR_MESSAGE },
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
