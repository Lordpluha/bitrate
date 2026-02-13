'use client'

import { useQuery } from '@shared/api'

export const useArtist = (artistId: string | undefined) => {
  const {
    data: artist,
    isLoading,
    error,
  } = useQuery(
    'get',
    `/api/v1/artists/{id}` as any, // оно тогда начинает ругаться на path, нечего не могу с этим сделать
    {
      params: {
        path: {
          id: artistId || '',
        },
      },
    },
    {
      enabled: !!artistId,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    },
  )

  return {
    artist: artist as any,
    isLoading,
    error,
  }
}
