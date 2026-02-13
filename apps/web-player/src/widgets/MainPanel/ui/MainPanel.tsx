'use client'

import React from 'react'

import { useAuth } from '@shared/hooks'
import { Typography } from '@spotify/ui-react'

import { Tabs } from './Tabs'
import { LikedPlaylist } from './LikedPlaylist'
import { PopularPlaylists } from './PopularPlaylists'
import { PopularArtists } from './PopularArtists'
import { Footer } from './Footer'

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'music', label: 'Music' },
  { id: 'podcasts', label: 'Podcasts' },
]

export const MainPanel = () => {
  const { user, isAuthenticated } = useAuth()
  const currentUser = user;

  return (
    <div className="h-full py-4 px-6 overflow-y-auto custom-scrollbar relative z-10">
      <Tabs tabs={tabs} />
      <LikedPlaylist />
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
