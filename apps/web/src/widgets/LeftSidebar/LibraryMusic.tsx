'use client'

import { fetchClient } from '@shared/api'
import { useUsers } from '@shared/hooks/useUsers'
import { ApiSchemas } from '@spotify/contracts'
import { useQuery } from '@tanstack/react-query'
import { MusicCardSm } from './MusicCardSm'

interface MusicItem {
  id: string
  title: string
  artist: string
  type: 'playlist' | 'album' | 'single' | 'podcast'
  cover: string
  tracksCount?: number
}

type Playlist = ApiSchemas['PlaylistEntity']

const likedSongsItem: MusicItem = {
  id: 'liked-songs',
  title: 'Liked Songs',
  artist: 'Playlist',
  type: 'playlist',
  cover: '/images/liked-songs.jpg',
  tracksCount: 0,
}

export const LibraryMusic = () => {
  const { getUserName } = useUsers()
  
  const { data: playlists, isLoading } = useQuery({
    queryKey: ['playlists'],
    queryFn: async () => {
      const { data } = await fetchClient.GET('/api/v1/playlists', {
        params: { path: { page: 1, limit: 20 } },
      })
      return data ? (data as Playlist[]) : []
    },
  })

  const musicItems = [likedSongsItem]
  if (Array.isArray(playlists)) {
    playlists.forEach((playlist) => {
      if (playlist) {
        musicItems.push({
          id: playlist.id,
          title: playlist.title,
          artist: getUserName(playlist.userId),
          type: 'playlist',
          cover: playlist.cover || '/images/default-playlist.jpg',
          tracksCount: 0
        })
      }
    })
  }

  if (isLoading) {
    return (
      <div className="mt-4 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-0.5 pb-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={i}
                className="flex items-center gap-3 p-2 rounded-md"
              >
                <div className="w-12 h-12 bg-gray-600 rounded-md animate-pulse" />
                <div className="flex-1">
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
        <div className="space-y-0.5 pb-4">
          {musicItems.map((item) => (
            <MusicCardSm key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
