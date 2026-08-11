'use client'

import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { clientFetchClient, useQuery } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { useEffect } from 'react'
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
  { limit = 100, page = 1, title }: UseTracksParams = {},
  options: UseTracksOptions = {},
) =>
  useQuery(
    'get',
    '/api/v1/tracks',
    {
      params: { query: { limit, page, ...(title ? { title } : {}) } },
    },
    {
      enabled: options.enabled ?? true,
      select: (data: unknown) =>
        normalizeTracksResponse(data).map(withPlayableUrl),
    },
  )

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
  const query = useQuery(
    'get',
    '/api/v1/tracks/liked',
    { params: { query: { limit: 100, page: 1 } } },
    {
      enabled: options.enabled ?? true,
      initialData: options.initialData,
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: options.staleTime ?? 30_000,
      select(data: unknown) {
        const tracks = normalizeTracksResponse(data).map(withPlayableUrl)
        const start = Math.max(page - 1, 0) * limit
        return tracks.slice(start, start + limit)
      },
    },
  )

  useEffect(() => {
    if (query.data) onSuccess?.(query.data)
  }, [onSuccess, query.data])

  return query
}
