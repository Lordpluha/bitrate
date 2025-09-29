'use client'

import React from 'react'


import { useAuth } from '@shared/hooks'
import { Typography } from '@spotify/ui'

import { Tabs } from './Tabs'
import { LastPlaylists } from './LastPlaylists'
import { PopularPlaylists } from './PopularPlaylists'
import { PopularArtists } from './PopularArtists'
import { Footer } from './Footer'


export const MainPanel = () => {
  const { user, isAuthenticated } = useAuth()
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

  return (
    <div className='h-full py-4 px-6 overflow-y-auto custom-scrollbar relative z-10'>
      <Tabs tabs={tabs} />
      <LastPlaylists items={lastPlaylists} />
      <div className='mt-6'>
        {isAuthenticated && user && (
          <div className='min-w-[280px] mb-8'>
            <p className='text-gray-400 text-xs'>Made For</p>
            <Typography.Heading5 className='text-text'>
              {user.username}
            </Typography.Heading5>
          </div>
        )}
        <PopularPlaylists />
        <PopularArtists />
        <Footer />
      </div>
    </div>
  )
}
