'use client'

import { useMemo } from 'react'
import { useAlbums } from '@/entities/Album'
import { useListeningHistory } from '@/entities/History'
import { usePlaylistLibraryItems } from '@/entities/Playlist'
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
  const { items: libraryPlaylists, isLoading: isPlaylistsPending } =
    usePlaylistLibraryItems()
  const { data: likedTracks, isPending: isLikedPending } = useLikedTracks()
  const { data: albums, isPending: isAlbumsPending } = useAlbums({
    page: 1,
    limit: 50,
  })
  const { data: history, isPending: isHistoryPending } = useListeningHistory({
    page: 1,
    limit: 50,
  })

  const playlists = useMemo(() => {
    return libraryPlaylists
      .filter((playlist) => includesQuery(playlist.title, query))
      .sort((first, second) => {
        if (first.id === 'liked-songs') return -1
        if (second.id === 'liked-songs') return 1

        return compareByTitleOrDate(
          first.title,
          second.title,
          first.createdAt,
          second.createdAt,
          sortMode,
        )
      })
  }, [libraryPlaylists, query, sortMode])

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

  const historyItems = useMemo(
    () =>
      (history ?? [])
        .filter((entry) => includesQuery(entry.track.title, query))
        .sort((first, second) =>
          compareByTitleOrDate(
            first.track.title,
            second.track.title,
            first.listenedAt,
            second.listenedAt,
            sortMode,
          ),
        ),
    [history, query, sortMode],
  )

  const isPending =
    (activeSection === 'playlists' && isPlaylistsPending) ||
    (activeSection === 'liked' && isLikedPending) ||
    (activeSection === 'albums' && isAlbumsPending) ||
    (activeSection === 'history' && isHistoryPending)

  return {
    albums: albumItems,
    history: historyItems,
    isPending,
    playlists,
    tracks,
  }
}
