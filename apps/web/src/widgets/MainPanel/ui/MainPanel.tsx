'use client'

import React, { useState } from 'react'

import { useAuth } from '@shared/hooks'
import { Typography } from '@spotify/ui-react'
import { PlaylistPage } from '@/views/Playlist'
import type { ApiSchemas } from '@spotify/contracts'

import { Tabs } from './Tabs'
import { LastPlaylists } from './LastPlaylists'
import { PopularPlaylists } from './PopularPlaylists'
import { PopularArtists } from './PopularArtists'
import { Footer } from './Footer'

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'music', label: 'Music' },
  { id: 'podcasts', label: 'Podcasts' },
]

const lastPlaylists: any[] = [
  {
    id: 'test-all-tracks',
    name: 'Test All Tracks',
    description: 'For player testing',
    imageUrl: '/images/default-playlist.jpg',
  },
  {
    id: 'liked',
    name: 'Liked Songs',
    description: '317 songs',
    imageUrl: '/images/liked-songs.jpg',
  },
  {
    id: 'drive',
    name: 'Drive',
    description: 'Playlist',
    imageUrl: '/images/drive-cover.jpg',
  },
]

export const MainPanel = () => {
  const { user, isAuthenticated } = useAuth()
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null,
  )

  const handlePlaylistClick = (id: string) => {
    setSelectedPlaylistId(id)
  }

  if (selectedPlaylistId) {
    return (
      <div className="h-full overflow-y-auto custom-scrollbar relative z-10">
        <PlaylistPage playlistId={selectedPlaylistId} />
      </div>
    )
  }

  const currentUser = user as ApiSchemas['UserEntity'] | null

  return (
    <div className="h-full py-4 px-6 overflow-y-auto custom-scrollbar relative z-10">
      <Tabs tabs={tabs} />
      <LastPlaylists
        items={lastPlaylists}
        onPlaylistClick={handlePlaylistClick}
      />
      <div className="mt-6">
        {isAuthenticated && currentUser ? (
          <div className="min-w-[280px] mb-8">
            <p className="text-gray-400 text-xs">Made For</p>
            <Typography as="h5" size="heading5" className="text-text">
              {currentUser.username || 'User'}
            </Typography>
          </div>
        ) : null}
        <PopularPlaylists />
        <PopularArtists />
        <Footer />
      </div>
    </div>
  )
}
