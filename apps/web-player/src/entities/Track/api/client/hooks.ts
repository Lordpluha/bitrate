'use client'

import {
  trackResponseSchema,
  tracksResponseSchema,
} from '@entities/Track/api/trackResponse.schema'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import {
  clientFetchClient,
  queryOptions,
  useMutation,
  useQuery,
} from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { getApiUrl } from '@shared/utils/mediaUrl'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

type UseTracksParams = {
  page?: number
  limit?: number
  title?: string
}

type UseTracksOptions = {
  enabled?: boolean
}

type UseLikedTracksOptions = {
  enabled?: boolean
  initialData?: TrackEntity[]
  staleTime?: number
}

const withPlayableUrl = (track: TrackEntity): TrackEntity => ({
  ...track,
  audioUrl: getApiUrl(`/api/v1/tracks/stream/${track.id}`),
})

const likedTracksQueryKey = queryOptions('get', '/api/v1/tracks/liked', {
  params: { query: { page: 1, limit: 100 } },
}).queryKey

const trackDetailQueryKey = (trackId: string) =>
  queryOptions('get', '/api/v1/tracks/{id}', {
    params: { path: { id: trackId } },
  }).queryKey

const normalizeTracksResponse = (data: unknown) =>
  tracksResponseSchema.parse(data)

export const getTrackById = async (trackId: string) => {
  const { data, response } = await clientFetchClient.GET(
    '/api/v1/tracks/{id}',
    {
      params: { path: { id: trackId } },
    },
  )

  ensureOkResponse(response, 'Failed to fetch track')

  return withPlayableUrl(trackResponseSchema.parse(data))
}

export const useTracks = (
  { page = 1, limit = 100, title }: UseTracksParams = {},
  options: UseTracksOptions = {},
) =>
  useQuery(
    'get',
    '/api/v1/tracks',
    {
      params: {
        query: {
          page,
          limit,
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

export const useTrack = (trackId?: string) =>
  useQuery(
    'get',
    '/api/v1/tracks/{id}',
    {
      params: {
        path: { id: trackId ?? '' },
      },
    },
    {
      enabled: !!trackId,
      select: (track) =>
        track ? withPlayableUrl(trackResponseSchema.parse(track)) : track,
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
    {
      params: {
        query: {
          page: 1,
          limit: 100,
        },
      },
    },
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

export const useLikeTrack = () => {
  const queryClient = useQueryClient()

  return useMutation('post', '/api/v1/tracks/{id}/like', {
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: likedTracksQueryKey }),
        queryClient.invalidateQueries({
          queryKey: trackDetailQueryKey(variables.params.path.id),
        }),
      ])
    },
  })
}

export const useUnlikeTrack = () => {
  const queryClient = useQueryClient()

  return useMutation('delete', '/api/v1/tracks/{id}/like', {
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: likedTracksQueryKey }),
        queryClient.invalidateQueries({
          queryKey: trackDetailQueryKey(variables.params.path.id),
        }),
      ])
    },
  })
}
