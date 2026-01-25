'use client'

import { useQuery } from '@shared/api'

interface UseTracksParams {
  page?: number
  limit?: number
  title?: string
}

export const useTracks = (params: UseTracksParams = {}) => {
  const { page = 1, limit = 100, title } = params

  return useQuery('get', '/api/v1/tracks', {
    params: {
      query: {
        page,
        limit,
        ...(title && { title })
      }
    }
  }) as any // тут оставляем пока
}
