'use client'

import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { useQuery } from '@shared/api/client'
import { getApiUrl } from '@shared/utils/mediaUrl'

export const useLikedTracks = (
  page = 1,
  limit = 100,
  onSuccess?: (data: TrackEntity[]) => void,
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
      select(data: unknown) {
        const tracks = Array.isArray(data) ? (data as TrackEntity[]) : []
        const result = tracks.map((track) => ({
          ...track,
          audioUrl: getApiUrl(`/api/v1/tracks/stream/${track.id}`),
        }))

        onSuccess?.(result)

        return result
      },
    },
  )
