"use client"
import React, { useState } from 'react'

interface MusicItem {
  id: string
  title: string
  artist: string
  type: 'playlist' | 'album' | 'single' | 'podcast'
  cover: string
  tracksCount?: number
}

const mockMusicData: MusicItem[] = [
  {
    id: '1',
    title: 'Liked Songs',
    artist: 'Playlist',
    type: 'playlist',
    cover: '/images/liked-songs.jpg',
    tracksCount: 359
  },
  {
    id: '2',
    title: 'Drive',
    artist: 'Grant',
    type: 'playlist',
    cover: '/images/drive-cover.jpg'
  },
  {
    id: '3',
    title: 'WHAT CAN I SAY',
    artist: '7ych',
    type: 'album',
    cover: '/images/what-can-i-say.jpg'
  },
  {
    id: '4',
    title: 'STREET POETS',
    artist: 'Takeover Records',
    type: 'playlist',
    cover: '/images/street-poets.jpg'
  },
  {
    id: '5',
    title: 'David Laid songs and Memory Reboot',
    artist: 'Santino Petracchini',
    type: 'playlist',
    cover: '/images/david-laid.jpg'
  },
  {
    id: '6',
    title: 'Caramelldansen',
    artist: 'Caramella Girls',
    type: 'single',
    cover: '/images/caramelldansen.jpg'
  },
  {
    id: '7',
    title: 'SO TIRED',
    artist: 'NUEKI',
    type: 'single',
    cover: '/images/so-tired.jpg'
  },
  {
    id: '8',
    title: 'LA LA LA',
    artist: 'YOHYOSAN',
    type: 'single',
    cover: '/images/la-la-la.jpg'
  },
  {
    id: '9',
    title: 'THE PLAYLIST',
    artist: 'Ollie',
    type: 'playlist',
    cover: '/images/the-playlist.jpg'
  },
  {
    id: '10',
    title: 'IELTS Plus Podcast',
    artist: "Jack's English",
    type: 'podcast',
    cover: '/images/ielts-podcast.jpg'
  },
  {
    id: '11',
    title: 'Global Hip-Hop',
    artist: 'Spotify',
    type: 'playlist',
    cover: '/images/global-hiphop.jpg',
    tracksCount: 75
  },
  {
    id: '12',
    title: 'Rock Mix',
    artist: 'Spotify',
    type: 'playlist',
    cover: '/images/rock-mix.jpg',
    tracksCount: 50
  },
  {
    id: '13',
    title: 'Hardstyle Bangers',
    artist: 'Spotify',
    type: 'playlist',
    cover: '/images/hardstyle.jpg',
    tracksCount: 120
  },
  {
    id: '14',
    title: 'MODE: PHONK / BRAZILIAN / FUNK / HARD',
    artist: 'leronjyone',
    type: 'playlist',
    cover: '/images/phonk-mode.jpg',
    tracksCount: 89
  },
  {
    id: '15',
    title: 'Beat It',
    artist: 'Michael Jackson',
    type: 'single',
    cover: '/images/beat-it.jpg'
  },
  {
    id: '16',
    title: 'Synthwave Essentials',
    artist: 'Spotify',
    type: 'playlist',
    cover: '/images/synthwave.jpg',
    tracksCount: 100
  },
  {
    id: '17',
    title: 'Russian Rap Hits',
    artist: 'Spotify',
    type: 'playlist',
    cover: '/images/russian-rap.jpg',
    tracksCount: 200
  },
  {
    id: '18',
    title: 'Lofi Hip Hop',
    artist: 'ChilledCow',
    type: 'playlist',
    cover: '/images/lofi.jpg',
    tracksCount: 150
  },
  {
    id: '19',
    title: 'Gaming Music',
    artist: 'Spotify',
    type: 'playlist',
    cover: '/images/gaming.jpg',
    tracksCount: 80
  },
  {
    id: '20',
    title: 'Workout Motivation',
    artist: 'Spotify',
    type: 'playlist',
    cover: '/images/workout.jpg',
    tracksCount: 65
  }
]

const MusicCard = ({ item }: { item: MusicItem }) => {
  const [imageError, setImageError] = useState(false)

  const getTypeColor = () => {
    switch (item.type) {
      case 'playlist': return 'from-green-500 to-blue-500'
      case 'album': return 'from-orange-500 to-red-500'
      case 'single': return 'from-purple-500 to-pink-500'
      case 'podcast': return 'from-blue-600 to-indigo-600'
      default: return 'from-gray-500 to-gray-700'
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className='group flex items-center gap-3 p-2 rounded-md hover:bg-white/10 cursor-pointer transition-all duration-150'>
      <div className='w-12 h-12 rounded-md flex-shrink-0 overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-150'>
        {!imageError ? (
          <img
            src={item.cover}
            alt={item.title}
            className='w-full h-full object-cover'
            onError={handleImageError}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getTypeColor()} flex items-center justify-center`}>
            <span className='text-white text-xs font-bold drop-shadow-sm'>
              {item.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className='flex-1 min-w-0'>
        <h3 className='text-white font-semibold text-sm truncate group-hover:text-white transition-colors duration-150 leading-tight'>
          {item.title}
        </h3>
        <p className='text-gray-400 text-xs truncate group-hover:text-gray-300 transition-colors duration-150 mt-0.5'>
          {item.type === 'playlist' ? 'Playlist' : item.type === 'album' ? 'Album' : item.type === 'single' ? 'Single' : 'Podcast'} • {item.artist}
          {item.tracksCount && ` • ${item.tracksCount} songs`}
        </p>
      </div>
    </div>
  )
}

export const LibraryMusic = () => {
  return (
    <div className='mt-4 flex-1 overflow-hidden'>
      <div className='h-full overflow-y-auto pr-2 custom-scrollbar'>
        <div className='space-y-0.5 pb-4'>
          {mockMusicData.map((item) => (
            <MusicCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
