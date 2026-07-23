import { useEffect, useMemo, useState } from 'react'
import {
  getSavedPlaylistsStorageKey,
  type SavedPlaylistLibraryItem,
  savedPlaylistsChangedEvent,
  useMyPlaylists,
} from '@/entities/Playlist'
import { fallbackPlaylistCover } from '@/shared/constants'
import { useAuth } from '@/shared/hooks'
import { getPlaylistCoverUrl } from '@/shared/utils/mediaUrl'
import type {
  LibraryMusicItem,
  PlaylistLibrarySourceItem,
} from '@/widgets/LeftSidebar/model/library.types'

const likedSongsItem: LibraryMusicItem = {
  cover: '/images/liked-songs.jpg',
  id: 'liked-songs',
  title: 'Liked Songs',
  tracksCount: 0,
  type: 'playlist',
  username: 'Playlist',
}

export const useLibraryMusicItems = () => {
  const { user } = useAuth()
  const { data: playlists, isLoading } = useMyPlaylists()
  const [savedPlaylists, setSavedPlaylists] = useState<
    SavedPlaylistLibraryItem[]
  >([])
  const storageKey = useMemo(
    () => getSavedPlaylistsStorageKey(user?.id),
    [user?.id],
  )

  useEffect(() => {
    const readSavedPlaylists = () => {
      const rawValue = window.localStorage.getItem(storageKey)
      if (!rawValue) {
        setSavedPlaylists([])
        return
      }
      try {
        const value = JSON.parse(rawValue)
        setSavedPlaylists(
          Array.isArray(value) ? (value as SavedPlaylistLibraryItem[]) : [],
        )
      } catch {
        setSavedPlaylists([])
      }
    }

    readSavedPlaylists()
    window.addEventListener(savedPlaylistsChangedEvent, readSavedPlaylists)
    window.addEventListener('storage', readSavedPlaylists)
    return () => {
      window.removeEventListener(savedPlaylistsChangedEvent, readSavedPlaylists)
      window.removeEventListener('storage', readSavedPlaylists)
    }
  }, [storageKey])

  const items = useMemo(() => {
    const result: LibraryMusicItem[] = [likedSongsItem]
    const playlistItems = Array.isArray(playlists)
      ? (playlists as PlaylistLibrarySourceItem[])
      : []

    playlistItems.forEach((playlist) => {
      result.push({
        cover: getPlaylistCoverUrl(playlist.cover || fallbackPlaylistCover),
        id: playlist.id,
        title: playlist.title,
        tracksCount: playlist.tracks?.length ?? 0,
        type: 'playlist',
        username: playlist.user?.username ?? 'Unknown Artist',
      })
    })

    const ids = new Set(result.map((item) => item.id))
    savedPlaylists.forEach((playlist) => {
      if (ids.has(playlist.id)) return
      result.push({
        cover: playlist.cover || getPlaylistCoverUrl(null),
        id: playlist.id,
        title: playlist.title,
        tracksCount: playlist.tracksCount ?? 0,
        type: 'playlist',
        username: playlist.username,
      })
    })
    return result
  }, [playlists, savedPlaylists])

  return { isLoading, items }
}
