'use client'

import { useAlbums } from '@entities/Album'
import { useTracks } from '@entities/Track'
import { useMemo } from 'react'
import type { ArtistContent } from '@/views/Artist/model/artist.types'

export type UseArtistContentInput = {
  artistId: string
}

const CATALOGUE_PAGE_SIZE = 200

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
