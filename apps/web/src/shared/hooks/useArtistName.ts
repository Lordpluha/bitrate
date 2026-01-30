'use client'

import { useQuery } from '@shared/api'
import { useMemo } from 'react'

export const useArtistName = (artistId: string | undefined) => {
  const { data: artist } = useQuery(
    'get',
    `/api/v1/artists/{id}` as any,
    {
      params: {
        path: {
          id: artistId || ''
        }
      }
    },
    {
      enabled: !!artistId,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  )

  return useMemo(() => {
    if (!artist) return 'Unknown Artist'
    return (artist as any).username || (artist as any).name || 'Unknown Artist'
  }, [artist])
}
