'use client'

import { useAlbums } from '@entities/Album'
import { useTracks } from '@entities/Track'
import { useMemo } from 'react'
import type { ArtistContent } from '@/views/Artist/model/artist.types'

export type UseArtistContentInput = {
  artistId: string
}

/**
 * The API caps `limit` at 100 and answers 400 above it. Asking for more made
 * both catalogue requests fail, which is why the page showed "0 songs · 0
 * albums" with the play button disabled.
 */
const CATALOGUE_PAGE_SIZE = 100

/**
 * Collects an artist's tracks and albums.
 * The API has no artist-scoped list endpoints, so the catalogue is filtered client-side.
 */
export const useArtistContent = ({
  artistId,
}: UseArtistContentInput): ArtistContent => {
  const tracksQuery = useTracks({ limit: CATALOGUE_PAGE_SIZE, page: 1 })
  const albumsQuery = useAlbums({ limit: CATALOGUE_PAGE_SIZE, page: 1 })

  const tracks = useMemo(
    () =>
      (tracksQuery.data ?? []).filter((track) => track.artistId === artistId),
    [tracksQuery.data, artistId],
  )

  const albums = useMemo(
    () =>
      (albumsQuery.data ?? [])
        .filter((album) => album.artistId === artistId)
        .map((album) => ({
          cover: album.cover,
          id: album.id,
          releaseDate: album.releaseDate,
          title: album.title,
        }))
        .sort((left, right) =>
          (right.releaseDate ?? '').localeCompare(left.releaseDate ?? ''),
        ),
    [albumsQuery.data, artistId],
  )

  return {
    albums,
    isError: tracksQuery.isError || albumsQuery.isError,
    isPending: tracksQuery.isPending || albumsQuery.isPending,
    tracks,
  }
}
