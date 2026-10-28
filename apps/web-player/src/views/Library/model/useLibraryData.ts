'use client'

import { useMemo } from 'react'
import { useLikedAlbums } from '@/entities/Album'
import { LIKED_SONGS_ID, usePlaylistLibraryItems } from '@/entities/Playlist'
import { useLikedTracks } from '@/entities/Track'
import type {
  LibraryData,
  LibrarySection,
  SortMode,
} from '@/views/Library/model/library.types'
import {
  compareByTitleOrDate,
  includesQuery,
} from '@/views/Library/model/library.utils'

type UseLibraryDataOptions = {
  activeSection: LibrarySection
  query: string
  sortMode: SortMode
}

export const useLibraryData = ({
  activeSection,
  query,
  sortMode,
}: UseLibraryDataOptions): LibraryData => {
  const playlistItems = usePlaylistLibraryItems()
  const libraryPlaylists = playlistItems.items
  const isPlaylistsPending = playlistItems.isLoading
  const liked = useLikedTracks()
  const likedTracks = liked.data
  const isLikedPending = liked.isPending
  const likedAlbums = useLikedAlbums()
  const albums = likedAlbums.data
  const isAlbumsPending = likedAlbums.isPending

  const playlists = useMemo(() => {
    return libraryPlaylists
      .map((playlist) =>
        playlist.id === LIKED_SONGS_ID
          ? { ...playlist, tracksCount: likedTracks?.length ?? 0 }
          : playlist,
      )
      .filter((playlist) => includesQuery(playlist.title, query))
      .sort((first, second) => {
        if (first.id === LIKED_SONGS_ID) return -1
        if (second.id === LIKED_SONGS_ID) return 1

        return compareByTitleOrDate(
          first.title,
          second.title,
          first.createdAt,
          second.createdAt,
          sortMode,
        )
      })
  }, [likedTracks, libraryPlaylists, query, sortMode])

  const tracks = useMemo(
    () =>
      (likedTracks ?? [])
        .filter((track) => includesQuery(track.title, query))
        .sort((first, second) =>
          compareByTitleOrDate(
            first.title,
            second.title,
            first.createdAt,
            second.createdAt,
            sortMode,
          ),
        ),
    [likedTracks, query, sortMode],
  )

  const albumItems = useMemo(() => {
    const items = albums ?? []

    return items
      .filter((album) => includesQuery(album.title, query))
      .sort((first, second) =>
        compareByTitleOrDate(
          first.title,
          second.title,
          first.releaseDate ?? first.createdAt,
          second.releaseDate ?? second.createdAt,
          sortMode,
        ),
      )
  }, [albums, query, sortMode])

  const isPending =
    (activeSection === 'playlists' && isPlaylistsPending) ||
    (activeSection === 'liked' && isLikedPending) ||
    (activeSection === 'albums' && isAlbumsPending)

  /** Only the section on screen decides whether the page shows an error. */
  const section =
    activeSection === 'playlists'
      ? playlistItems
      : activeSection === 'liked'
        ? liked
        : likedAlbums

  return {
    albums: albumItems,
    isError: section.isError,
    isPending,
    refetch: () => void section.refetch(),
    playlists,
    tracks,
  }
}
