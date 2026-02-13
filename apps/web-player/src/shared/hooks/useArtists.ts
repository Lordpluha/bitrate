'use client'

import { useQuery } from '@shared/api'

interface Artist {
  id: string
  username: string
  avatar?: string
  backgroundImage?: string
  bio?: string
}

export const useArtists = () => {
  const { data, isPending, error } = useQuery('get', '/api/v1/artists', {
    params: {
      query: {
        page: 1,
        limit: 100,
      },
    },
  })

  const artists = Array.isArray(data) ? (data as Artist[]) : []
  const artistsMap = new Map<string, string>(
    artists.map((artist) => [artist.id, artist.username]),
  )

  return {
    artistsMap,
    isPending,
    error,
    getArtistName: (artistId: string): string =>
      artistsMap.get(artistId) || artistId,
  }
}
