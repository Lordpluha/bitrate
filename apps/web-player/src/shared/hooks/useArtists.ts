'use client'

import { useQuery } from '@shared/api/client'

export const useArtists = (page = 1, limit = 100) =>
  useQuery('get', '/api/v1/artists', {
    params: {
      query: {
        page,
        limit,
      },
    },
  })
