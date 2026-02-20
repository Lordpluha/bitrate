'use client'

import { useQuery } from '@shared/api/client'

export const usePlaylists = (page = 1, limit = 20) =>
  useQuery('get', '/api/v1/playlists', {
    params: {
      query: {
        page,
        limit,
      },
    },
  })
