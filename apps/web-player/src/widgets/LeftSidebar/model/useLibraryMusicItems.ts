import { useEffect, useMemo, useState } from 'react'
import {
  getSavedPlaylists,
  getSavedPlaylistsStorageKey,
  type SavedPlaylistLibraryItem,
  savedPlaylistsChangedEvent,
  useMyPlaylists,
} from '@/entities/Playlist'
import { fallbackPlaylistCover } from '@/shared/constants'
import { useAuth } from '@/shared/hooks'
import { getPlaylistCoverUrl } from '@/shared/utils/mediaUrl'
import type { LibraryMusicItem } from '@/widgets/LeftSidebar/model/library.types'

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
      setSavedPlaylists(getSavedPlaylists(storageKey))
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
    const playlistItems = playlists ?? []

    playlistItems.forEach((playlist) => {
      result.push({
        cover: getPlaylistCoverUrl(playlist.cover || fallbackPlaylistCover),
        id: playlist.id,
        title: playlist.title,
        tracksCount: playlist._count.tracks,
        type: 'playlist',
        username: user?.username ?? 'Playlist',
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
  }, [playlists, savedPlaylists, user?.username])

  return { isLoading, items }
}
