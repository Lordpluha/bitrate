'use client'

import { useQuery } from '@shared/api'

export const useArtists = () => {
  const { data, isPending, error } = useQuery('get', '/api/v1/artists', {
    params: {
      query: {
        page: 1,
        limit: 100
      }
    }
  }) as any

  const artists = Array.isArray(data) ? data : data?.data || []
  const artistsMap = new Map<string, string>(artists.map((artist: any) => [artist.id, artist.username]))

  return {
    artistsMap,
    isPending,
    error,
    getArtistName: (artistId: string): string => artistsMap.get(artistId) || artistId
  }
}
