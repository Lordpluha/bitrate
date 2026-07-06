'use client'

import {
  type SavedPlaylistLibraryItem,
  savedPlaylistsChangedEvent,
  savedPlaylistsStorageKey,
  useMyPlaylists,
} from '@entities/Playlist'
import { fallbackPlaylistCover } from '@shared/constants'
import { ROUTES } from '@shared/routes'
import { MusicCardLg } from '@shared/ui'
import { getPlaylistCoverUrl } from '@shared/utils/mediaUrl'
import { useEffect, useState } from 'react'
import { MusicCardSm } from './MusicCardSm'

interface MusicItem {
  id: string
  title: string
  username: string
  type: 'playlist' | 'album' | 'single' | 'podcast'
  cover: string
  tracksCount?: number
}

const likedSongsItem: MusicItem = {
  id: 'liked-songs',
  title: 'Liked Songs',
  username: 'Playlist',
  type: 'playlist',
  cover: '/images/liked-songs.jpg',
  tracksCount: 0,
}

const loadingItemKeys = [
  'loading-1',
  'loading-2',
  'loading-3',
  'loading-4',
  'loading-5',
  'loading-6',
  'loading-7',
  'loading-8',
  'loading-9',
  'loading-10',
]

type LibraryMusicProps = {
  isCollapsed?: boolean
  isExpanded?: boolean
}

export const LibraryMusic = ({
  isCollapsed = false,
  isExpanded = false,
}: LibraryMusicProps) => {
  const { data: playlists, isLoading } = useMyPlaylists()
  const [savedPlaylists, setSavedPlaylists] = useState<
    SavedPlaylistLibraryItem[]
  >([])

  useEffect(() => {
    const readSavedPlaylists = () => {
      const rawValue = window.localStorage.getItem(savedPlaylistsStorageKey)
      if (!rawValue) {
        setSavedPlaylists([])
        return
      }

      try {
        const parsedValue = JSON.parse(rawValue)
        setSavedPlaylists(
          Array.isArray(parsedValue)
            ? (parsedValue as SavedPlaylistLibraryItem[])
            : [],
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
  }, [])

  const musicItems = [likedSongsItem]
  const playlistItems = Array.isArray(playlists)
    ? (playlists as unknown as Array<{
        cover?: string | null
        id: string
        title: string
        tracks?: unknown[]
        user?: { username?: string }
      }>)
    : []

  if (playlistItems.length > 0) {
    playlistItems.forEach((playlist) => {
      if (playlist) {
        musicItems.push({
          id: playlist.id,
          title: playlist.title,
          username: playlist.user?.username ?? 'Unknown Artist',
          type: 'playlist',
          cover: getPlaylistCoverUrl(playlist.cover || fallbackPlaylistCover),
          tracksCount: playlist.tracks?.length ?? 0,
        })
      }
    })
  }

  const existingPlaylistIds = new Set(musicItems.map((item) => item.id))
  savedPlaylists.forEach((playlist) => {
    if (existingPlaylistIds.has(playlist.id)) return

    musicItems.push({
      id: playlist.id,
      title: playlist.title,
      username: playlist.username,
      type: 'playlist',
      cover: playlist.cover || getPlaylistCoverUrl(null),
      tracksCount: playlist.tracksCount ?? 0,
    })
  })

  if (isLoading) {
    return (
      <div className="mt-4 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
          <div
            className={
              isExpanded
                ? 'grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 pb-4'
                : isCollapsed
                  ? 'flex flex-col items-center gap-3 pb-4'
                  : 'space-y-0.5 pb-4'
            }
          >
            {loadingItemKeys.map((loadingKey) => (
              <div
                className={
                  isExpanded
                    ? 'rounded-lg p-3'
                    : isCollapsed
                      ? 'h-14 w-14 rounded-md'
                      : 'flex items-center gap-3 p-2 rounded-md'
                }
                key={loadingKey}
              >
                <div
                  className={
                    isExpanded
                      ? 'aspect-square w-full rounded-md bg-gray-600 animate-pulse'
                      : isCollapsed
                        ? 'h-14 w-14 rounded-md bg-gray-600 animate-pulse'
                        : 'w-12 h-12 bg-gray-600 rounded-md animate-pulse'
                  }
                />
                <div className={isExpanded ? 'mt-3' : 'flex-1'}>
                  <div className="h-4 bg-gray-600 rounded animate-pulse mb-1" />
                  <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
        <div
          className={
            isExpanded
              ? 'grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 pb-4'
              : isCollapsed
                ? 'flex flex-col items-center gap-3 pb-4'
                : 'space-y-0.5 pb-4'
          }
        >
          {musicItems.map((item) =>
            isExpanded ? (
              <MusicCardLg
                description={`${item.type.slice(0, 1).toUpperCase()}${item.type.slice(1)} • ${item.username}`}
                href={
                  item.id === 'liked-songs'
                    ? ROUTES.likedSongs
                    : ROUTES.playlist(item.id)
                }
                id={item.id}
                imageUrl={item.cover}
                key={item.id}
                name={item.title}
              />
            ) : (
              <MusicCardSm
                isCollapsed={isCollapsed}
                item={item}
                key={item.id}
              />
            ),
          )}
        </div>
      </div>
    </div>
  )
}
