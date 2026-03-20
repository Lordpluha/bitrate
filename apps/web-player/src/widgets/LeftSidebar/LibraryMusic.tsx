'use client'

import { useQuery } from '@shared/api/client'
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

export const LibraryMusic = () => {
  const { data: playlists, isLoading } = useQuery('get', '/api/v1/playlists', {
    params: {
      query: {
        page: 1,
        limit: 20,
      },
    },
  })

  const musicItems = [likedSongsItem]
  if (Array.isArray(playlists)) {
    playlists.forEach((playlist) => {
      if (playlist) {
        const playlistWithUser = playlist as {
          user?: { username?: string }
        }

        musicItems.push({
          id: playlist.id,
          title: playlist.title,
          username: playlistWithUser.user?.username ?? 'Unknown Artist',
          type: 'playlist',
          cover: playlist.cover || '/images/default-playlist.jpg',
          tracksCount: 0,
        })
      }
    })
  }

  if (isLoading) {
    return (
      <div className="mt-4 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-0.5 pb-4">
            {loadingItemKeys.map((loadingKey) => (
              <div
                className="flex items-center gap-3 p-2 rounded-md"
                key={loadingKey}
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
            <MusicCardSm item={item} key={item.id} />
          ))}
        </div>
      </div>
    </div>
  )
}
