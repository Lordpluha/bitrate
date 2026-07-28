'use client'

import { useEffect, useState } from 'react'
import {
  useLikePlaylist,
  useUnlikePlaylist,
} from '@/entities/Playlist/api/client'
import {
  getSavedPlaylistsStorageKey,
  removeSavedPlaylistFromLibrary,
  savePlaylistToLibrary,
} from '@/entities/Playlist/models/savedPlaylistLibrary'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'
import { useAuth } from '@/shared/hooks'

export type LikeablePlaylist = {
  cover?: string
  id: string
  ownerName?: string
  title?: string
  tracksCount?: number
}

type UsePlaylistLikeOptions = {
  initialLiked?: boolean
  playlist: LikeablePlaylist
}

export const usePlaylistLike = ({
  initialLiked = false,
  playlist,
}: UsePlaylistLikeOptions) => {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(initialLiked)
  const likePlaylist = useLikePlaylist()
  const unlikePlaylist = useUnlikePlaylist()
  const userStorageScope = user?.id ?? 'anonymous'
  const likedPlaylistStorageKey = `spotify:web-player:liked-playlist:${userStorageScope}:${playlist.id}`
  const savedPlaylistsStorageKey = getSavedPlaylistsStorageKey(userStorageScope)
  const isPending = likePlaylist.isPending || unlikePlaylist.isPending

  useEffect(() => {
    const storedValue = window.localStorage.getItem(likedPlaylistStorageKey)

    if (storedValue === 'true' || storedValue === 'false') {
      setIsLiked(storedValue === 'true')
      return
    }

    setIsLiked(initialLiked)
  }, [initialLiked, likedPlaylistStorageKey])

  const toggleLike = async () => {
    if (isPending) return

    try {
      if (isLiked) {
        await unlikePlaylist.mutateAsync({
          params: { path: { id: playlist.id } },
        })
        setIsLiked(false)
        window.localStorage.setItem(likedPlaylistStorageKey, 'false')
        removeSavedPlaylistFromLibrary(savedPlaylistsStorageKey, playlist.id)
        showApiSuccessToast('Removed from Your Library')
        return
      }

      await likePlaylist.mutateAsync({
        params: { path: { id: playlist.id } },
      })
      setIsLiked(true)
      window.localStorage.setItem(likedPlaylistStorageKey, 'true')
      savePlaylistToLibrary(savedPlaylistsStorageKey, {
        cover: playlist.cover,
        id: playlist.id,
        title: playlist.title ?? 'playlist',
        tracksCount: playlist.tracksCount ?? 0,
        username: playlist.ownerName ?? 'Playlist',
      })
      showApiSuccessToast('Added to Your Library')
    } catch (error) {
      showApiErrorToast(
        error,
        `Failed to update ${playlist.title ?? 'playlist'}`,
      )
    }
  }

  return {
    isLiked,
    isPending,
    toggleLike,
  }
}
