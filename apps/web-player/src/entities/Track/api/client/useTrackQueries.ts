'use client'

import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { clientFetchClient, useQuery } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { useQuery as useTanStackQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { tracksPaginatedResponseSchema } from '../trackResponse.schema'
import {
  normalizeTrackResponse,
  normalizeTracksResponse,
  type UseLikedTracksOptions,
  type UseTracksOptions,
  type UseTracksParams,
  withPlayableUrl,
} from './trackQuery'

export const getTrackById = async (trackId: string) => {
  const { data, response } = await clientFetchClient.GET(
    '/api/v1/tracks/{id}',
    { params: { path: { id: trackId } } },
  )

  ensureOkResponse(response, 'Failed to fetch track')
  return withPlayableUrl(normalizeTrackResponse(data))
}

export const useTracks = (
  { artistId, limit = 100, page = 1, title }: UseTracksParams = {},
  options: UseTracksOptions = {},
) =>
  useQuery(
    'get',
    '/api/v1/tracks',
    {
      params: {
        query: {
          ...(artistId ? { artistId } : {}),
          limit,
          page,
          ...(title ? { title } : {}),
        },
      },
    },
    {
      enabled: options.enabled ?? true,
      select: (data: unknown) =>
        normalizeTracksResponse(data).map(withPlayableUrl),
    },
  )

const ARTIST_TRACKS_PAGE_SIZE = 100

const getArtistTracksPage = async (artistId: string, page: number) => {
  const { data, response } = await clientFetchClient.GET('/api/v1/tracks', {
    params: {
      query: { artistId, limit: ARTIST_TRACKS_PAGE_SIZE, page },
    },
  })
  ensureOkResponse(response, 'Failed to fetch artist tracks')
  return tracksPaginatedResponseSchema.parse(data)
}

export const getAllTracksByArtist = async (artistId: string) => {
  const firstPage = await getArtistTracksPage(artistId, 1)
  const pageCount = Math.ceil(firstPage.total / firstPage.limit)
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) =>
      getArtistTracksPage(artistId, index + 2),
    ),
  )

  return [firstPage, ...remainingPages]
    .flatMap(({ data }) => data)
    .map(withPlayableUrl)
}

export const useArtistTracks = (artistId: string) =>
  useTanStackQuery({
    enabled: Boolean(artistId),
    queryFn: () => getAllTracksByArtist(artistId),
    queryKey: apiQueryKeys.tracks.artist(artistId),
    staleTime: 5 * 60_000,
  })

const LIKED_TRACKS_PAGE_SIZE = 100

const getLikedTracksPage = async (page: number) => {
  const { data, response } = await clientFetchClient.GET(
    '/api/v1/tracks/liked',
    { params: { query: { limit: LIKED_TRACKS_PAGE_SIZE, page } } },
  )
  ensureOkResponse(response, 'Failed to fetch liked tracks')
  return tracksPaginatedResponseSchema.parse(data)
}

export const getAllLikedTracks = async () => {
  const firstPage = await getLikedTracksPage(1)
  const pageCount = Math.ceil(firstPage.total / firstPage.limit)
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) =>
      getLikedTracksPage(index + 2),
    ),
  )

  return [firstPage, ...remainingPages]
    .flatMap(({ data }) => data)
    .map(withPlayableUrl)
}

export const useTrack = (trackId?: string) =>
  useQuery(
    'get',
    '/api/v1/tracks/{id}',
    { params: { path: { id: trackId ?? '' } } },
    {
      enabled: !!trackId,
      select: (track) =>
        track ? withPlayableUrl(normalizeTrackResponse(track)) : track,
    },
  )

export const useLikedTracks = (
  page = 1,
  limit = 100,
  onSuccess?: (data: TrackEntity[]) => void,
  options: UseLikedTracksOptions = {},
) => {
  const query = useTanStackQuery({
    enabled: options.enabled ?? true,
    initialData: options.initialData,
    queryFn: getAllLikedTracks,
    queryKey: apiQueryKeys.tracks.likedAll,
    refetchOnWindowFocus: false,
    retry: false,
    select(tracks) {
      const start = Math.max(page - 1, 0) * limit
      return tracks.slice(start, start + limit)
    },
    staleTime: options.staleTime ?? 30_000,
  })

  useEffect(() => {
    if (query.data) onSuccess?.(query.data)
  }, [onSuccess, query.data])

  return query
}
