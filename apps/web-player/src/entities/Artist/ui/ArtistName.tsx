'use client'

import { useArtist } from '@entities/Artist/api/client'

export type ArtistNameProps = {
  artistId?: string | null
  fallback?: string
}

/**
 * Resolves an artist's display name by id without rendering a link.
 * Use inside interactive elements where a nested anchor would be invalid markup.
 */
export const ArtistName = ({
  artistId,
  fallback = 'Unknown Artist',
}: ArtistNameProps) => {
  const { data: artist } = useArtist(artistId ?? undefined)

  return <>{artist?.username ?? fallback}</>
}
