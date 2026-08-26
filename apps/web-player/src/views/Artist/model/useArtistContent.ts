'use client'

import { useArtistAlbums } from '@entities/Album'
import { useArtistTracks } from '@entities/Track'
import { useMemo } from 'react'
import type { ArtistContent } from '@/views/Artist/model/artist.types'

export type UseArtistContentInput = {
  artistId: string
}

/** Collects every page of an artist-scoped catalogue. */
export const useArtistContent = ({
  artistId,
}: UseArtistContentInput): ArtistContent => {
  const tracksQuery = useArtistTracks(artistId)
  const albumsQuery = useArtistAlbums(artistId)

  const albums = useMemo(
    () =>
      (albumsQuery.data ?? [])
        .map((album) => ({
          cover: album.cover,
          id: album.id,
          releaseDate: album.releaseDate,
          title: album.title,
        }))
        .sort((left, right) =>
          (right.releaseDate ?? '').localeCompare(left.releaseDate ?? ''),
        ),
    [albumsQuery.data],
  )

  return {
    albums,
    isError: tracksQuery.isError || albumsQuery.isError,
    isPending: tracksQuery.isPending || albumsQuery.isPending,
    tracks: tracksQuery.data ?? [],
  }
}
