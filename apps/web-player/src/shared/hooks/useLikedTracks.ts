'use client'

import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { useQuery } from '@shared/api/client'

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
      select(data) {
        const result = data.map((track) => ({
          ...track,
          audioUrl: `${process.env.NEXT_PUBLIC_API_URL}api/v1/tracks/stream/${track.id}`,
        }))

        onSuccess?.(result)

        return result
      },
    },
  )
