'use client'

import { useQuery } from '@shared/api'

export const useArtist = (artistId?: string) => useQuery(
    'get',
    `/api/v1/artists/{id}`,
    {
      params: {
        path: {
          id: artistId!,
        },
      },
    },
    {
      enabled: !!artistId,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    },
  )

  