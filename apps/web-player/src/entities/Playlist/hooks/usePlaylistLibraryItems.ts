'use client'

import { useMemo } from 'react'
import {
  useLikedPlaylists,
  useMyPlaylists,
} from '@/entities/Playlist/api/client'
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

/** The library entry for Liked Songs; its count comes from the liked-tracks list. */
export const LIKED_SONGS_ID = 'liked-songs'

const likedSongsItem: PlaylistLibraryItem = {
  cover: '/images/liked-songs.svg',
  id: LIKED_SONGS_ID,
  title: 'Liked Songs',
  tracksCount: 0,
  type: 'playlist',
  username: 'Your Library',
}

export const usePlaylistLibraryItems = () => {
  const { user } = useAuth()
  const { data: playlists, isLoading } = useMyPlaylists()
  const { data: likedPlaylists, isLoading: areLikedLoading } =
    useLikedPlaylists(Boolean(user))

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
    for (const playlist of likedPlaylists ?? []) {
      if (ids.has(playlist.id)) continue

      result.push({
        cover: getPlaylistCoverUrl(playlist.cover || fallbackPlaylistCover),
        createdAt: playlist.likedAt ?? playlist.createdAt,
        id: playlist.id,
        title: playlist.title,
        tracksCount: 0,
        type: 'playlist',
        username: playlist.user?.username ?? 'Playlist',
      })
    }

    return result
  }, [likedPlaylists, playlists, user?.username])

  return { isLoading: isLoading || areLikedLoading, items }
}
