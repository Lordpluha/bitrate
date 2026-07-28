'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMyPlaylists } from '@/entities/Playlist/api/client'
import {
  getSavedPlaylists,
  getSavedPlaylistsStorageKey,
  type SavedPlaylistLibraryItem,
  savedPlaylistsChangedEvent,
} from '@/entities/Playlist/models/savedPlaylistLibrary'
import { fallbackPlaylistCover } from '@/shared/constants'
import { useAuth } from '@/shared/hooks'
import { getPlaylistCoverUrl } from '@/shared/utils/mediaUrl'

export type PlaylistLibraryItem = {
  cover: string
  createdAt?: string
  id: string
  title: string
  tracksCount: number
  type: 'playlist'
  username: string
}

const likedSongsItem: PlaylistLibraryItem = {
  cover: '/images/liked-songs.jpg',
  id: 'liked-songs',
  title: 'Liked Songs',
  tracksCount: 0,
  type: 'playlist',
  username: 'Your Library',
}

export const usePlaylistLibraryItems = () => {
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
    const result: PlaylistLibraryItem[] = [likedSongsItem]

    for (const playlist of playlists ?? []) {
      result.push({
        cover: getPlaylistCoverUrl(playlist.cover || fallbackPlaylistCover),
        createdAt: playlist.createdAt,
        id: playlist.id,
        title: playlist.title,
        tracksCount: playlist._count.tracks,
        type: 'playlist',
        username: user?.username ?? 'Playlist',
      })
    }

    const ids = new Set(result.map((item) => item.id))
    for (const playlist of savedPlaylists) {
      if (ids.has(playlist.id)) continue

      result.push({
        cover: playlist.cover || getPlaylistCoverUrl(null),
        id: playlist.id,
        title: playlist.title,
        tracksCount: playlist.tracksCount ?? 0,
        type: 'playlist',
        username: playlist.username,
      })
    }

    return result
  }, [playlists, savedPlaylists, user?.username])

  return { isLoading, items }
}
