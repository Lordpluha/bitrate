'use client'

import {
  useLikePlaylist,
  useUnlikePlaylist,
} from '@entities/Playlist/api/client'
import { showApiErrorToast, showApiSuccessToast } from '@shared/api/feedback'
import { useAuth } from '@shared/hooks'
import { cn } from '@spotify/ui-react'
import { Check, CirclePlus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type LikePlaylistButtonProps = {
  cover?: string
  initialLiked?: boolean
  ownerName?: string
  playlistId: string
  playlistTitle?: string
  tracksCount?: number
}

export const LikePlaylistButton = ({
  cover,
  initialLiked = false,
  ownerName = 'Playlist',
  playlistId,
  playlistTitle = 'playlist',
  tracksCount = 0,
}: LikePlaylistButtonProps) => {
  const { user } = useAuth()
  const userStorageScope = user?.id ?? 'anonymous'
  const storageKey = useMemo(
    () => `spotify:web-player:liked-playlist:${userStorageScope}:${playlistId}`,
    [playlistId, userStorageScope],
  )
  const savedPlaylistsStorageKey = useMemo(
    () => getSavedPlaylistsStorageKey(userStorageScope),
    [userStorageScope],
  )
  const [isLiked, setIsLiked] = useState(initialLiked)
  const likePlaylist = useLikePlaylist()
  const unlikePlaylist = useUnlikePlaylist()
  const isPending = likePlaylist.isPending || unlikePlaylist.isPending

  useEffect(() => {
    const storedValue = window.localStorage.getItem(storageKey)

    if (storedValue === 'true') {
      setIsLiked(true)
      return
    }

    if (storedValue === 'false') {
      setIsLiked(false)
      return
    }

    setIsLiked(initialLiked)
  }, [initialLiked, storageKey])

  const handleToggle = async () => {
    if (isPending) return

    try {
      if (isLiked) {
        await unlikePlaylist.mutateAsync({
          params: {
            path: {
              id: playlistId,
            },
          },
        })
        setIsLiked(false)
        window.localStorage.setItem(storageKey, 'false')
        removeSavedPlaylistFromLibrary(savedPlaylistsStorageKey, playlistId)
        showApiSuccessToast('Removed from Your Library')
        return
      }

      await likePlaylist.mutateAsync({
        params: {
          path: {
            id: playlistId,
          },
        },
      })
      setIsLiked(true)
      window.localStorage.setItem(storageKey, 'true')
      savePlaylistToLibrary(savedPlaylistsStorageKey, {
        cover,
        id: playlistId,
        title: playlistTitle,
        tracksCount,
        username: ownerName,
      })
      showApiSuccessToast('Added to Your Library')
    } catch (error) {
      showApiErrorToast(error, `Failed to update ${playlistTitle}`)
    }
  }

  return (
    <button
      aria-label={`${isLiked ? 'Remove' : 'Save'} ${playlistTitle}`}
      className={cn(
        'rounded-full p-1 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60',
        isLiked ? 'text-green-500' : 'text-text-subdued hover:text-text',
      )}
      disabled={isPending}
      onClick={(event) => {
        event.stopPropagation()
        void handleToggle()
      }}
      title={isLiked ? 'Remove from Your Library' : 'Save to Your Library'}
      type="button"
    >
      {isLiked ? (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-black">
          <Check size={20} strokeWidth={3} />
        </span>
      ) : (
        <CirclePlus size={34} />
      )}
    </button>
  )
}

export type SavedPlaylistLibraryItem = {
  cover?: string
  id: string
  title: string
  tracksCount?: number
  username: string
}

const savedPlaylistsStoragePrefix = 'spotify:web-player:saved-playlists'

export const getSavedPlaylistsStorageKey = (userId: string | undefined) =>
  `${savedPlaylistsStoragePrefix}:${userId ?? 'anonymous'}`

export const savedPlaylistsChangedEvent =
  'spotify:web-player:saved-playlists-changed'

const getSavedPlaylists = (storageKey: string) => {
  const rawValue = window.localStorage.getItem(storageKey)
  if (!rawValue) return []

  try {
    const parsedValue = JSON.parse(rawValue)

    return Array.isArray(parsedValue)
      ? (parsedValue as SavedPlaylistLibraryItem[])
      : []
  } catch {
    return []
  }
}

const savePlaylistToLibrary = (
  storageKey: string,
  playlist: SavedPlaylistLibraryItem,
) => {
  const currentPlaylists = getSavedPlaylists(storageKey)
  const nextPlaylists = [
    playlist,
    ...currentPlaylists.filter((item) => item.id !== playlist.id),
  ]

  window.localStorage.setItem(storageKey, JSON.stringify(nextPlaylists))
  window.dispatchEvent(new Event(savedPlaylistsChangedEvent))
}

const removeSavedPlaylistFromLibrary = (
  storageKey: string,
  playlistId: string,
) => {
  const nextPlaylists = getSavedPlaylists(storageKey).filter(
    (playlist) => playlist.id !== playlistId,
  )

  window.localStorage.setItem(storageKey, JSON.stringify(nextPlaylists))
  window.dispatchEvent(new Event(savedPlaylistsChangedEvent))
}
