'use client'

import React, { useState } from 'react'


import { useAuth } from '@shared/hooks'
import { Typography } from '@spotify/ui-react'
import { PlaylistPage } from '@/views/Playlist'

import { Tabs } from './Tabs'
import { LastPlaylists } from './LastPlaylists'
import { PopularPlaylists } from './PopularPlaylists'
import { PopularArtists } from './PopularArtists'
import { Footer } from './Footer'


export const MainPanel = () => {
  const { user, isAuthenticated } = useAuth()
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null)
  
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'music', label: 'Music' },
    { id: 'podcasts', label: 'Podcasts' }
  ]
  const lastPlaylists = [
    {
      id: 'liked',
      name: 'Liked Songs',
      description: '317 songs',
      imageUrl: '/images/liked-songs.jpg'
    },
    {
      id: 'drive',
      name: 'Drive',
      description: 'Playlist',
      imageUrl: '/images/drive-cover.jpg'
    }
  ]

  if (selectedPlaylistId) {
    return (
      <div className='h-full overflow-y-auto custom-scrollbar relative z-10'>
        <PlaylistPage 
          playlistId={selectedPlaylistId} 
          onBack={() => setSelectedPlaylistId(null)}
        />
      </div>
    )
  }

  return (
    <div className='h-full py-4 px-6 overflow-y-auto custom-scrollbar relative z-10'>
      <Tabs tabs={tabs} />
      <LastPlaylists 
        items={lastPlaylists} 
        onPlaylistClick={setSelectedPlaylistId}
      />
      <div className='mt-6'>
        {isAuthenticated && user && (
          <div className='min-w-[280px] mb-8'>
            <p className='text-gray-400 text-xs'>Made For</p>
            <Typography as='h5' size='heading5' className='text-text'>
              {user.username}
            </Typography>
          </div>
        )}
        <PopularPlaylists onPlaylistClick={setSelectedPlaylistId} />
        <PopularArtists />
        <Footer />
      </div>
    </div>
  )
}
