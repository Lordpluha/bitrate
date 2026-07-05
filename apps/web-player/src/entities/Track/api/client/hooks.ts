'use client'

import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { useMutation, useQuery } from '@shared/api/client'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { getApiUrl } from '@shared/utils/mediaUrl'
import { useQueryClient } from '@tanstack/react-query'

type UseTracksParams = {
  page?: number
  limit?: number
  title?: string
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

const isLikedTracksQuery = (queryKey: readonly unknown[]) =>
  JSON.stringify(queryKey).includes('/api/v1/tracks/liked')

export const useTracks = ({
  page = 1,
  limit = 100,
  title,
}: UseTracksParams = {}) =>
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
    {},
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
        track ? withPlayableUrl(track as TrackEntity) : track,
    },
  )

export const useLikedTracks = (
  page = 1,
  limit = 100,
  onSuccess?: (data: TrackEntity[]) => void,
  options: UseLikedTracksOptions = {},
) =>
  useQuery(
    'get',
    '/api/v1/tracks/liked',
    {
      params: {
        query: {
          page,
          limit,
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
        if (!Array.isArray(data)) {
          return undefined
        }

        const tracks = data as TrackEntity[]
        const result = tracks.map(withPlayableUrl)

        onSuccess?.(result)

        return result
      },
    },
  )

export const useLikeTrack = () => {
  const queryClient = useQueryClient()

  return useMutation('post', '/api/v1/tracks/{id}/like', {
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tracks'] }),
        queryClient.invalidateQueries({ queryKey: ['tracks', 'liked'] }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) => isLikedTracksQuery(queryKey),
        }),
        queryClient.invalidateQueries({
          queryKey: apiQueryKeys.tracks.detail(variables.params.path.id),
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
        queryClient.invalidateQueries({ queryKey: ['tracks'] }),
        queryClient.invalidateQueries({ queryKey: ['tracks', 'liked'] }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) => isLikedTracksQuery(queryKey),
        }),
        queryClient.invalidateQueries({
          queryKey: apiQueryKeys.tracks.detail(variables.params.path.id),
        }),
      ])
    },
  })
}
