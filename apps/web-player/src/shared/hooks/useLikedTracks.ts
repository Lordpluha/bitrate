'use client'

import { useQuery } from '@shared/api'

interface UseLikedTracksParams {
  page?: number
  limit?: number
}

export const useLikedTracks = (params: UseLikedTracksParams = {}) => {
  const { page = 1, limit = 100 } = params

  return useQuery('get', '/api/v1/tracks/liked', {
    params: {
      query: {
        page,
        limit,
      },
    },
  })
}
