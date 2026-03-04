'use client'

import { useAuth } from '@shared/hooks'
import { Typography } from '@spotify/ui-react'
import { Footer } from './Footer'
import { LikedPlaylist } from './LikedPlaylist'
import { PopularArtists } from './PopularArtists'
import { PopularPlaylists } from './PopularPlaylists'
import { Tabs } from './Tabs'

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'music', label: 'Music' },
  { id: 'podcasts', label: 'Podcasts' },
]

export const MainPanel = () => {
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="h-full py-4 px-6 overflow-y-auto custom-scrollbar relative z-10">
      <Tabs tabs={tabs} />
      <LikedPlaylist />
      <div className="mt-6">
        {isAuthenticated && user ? (
          <div className="min-w-[280px] mb-8">
            <p className="text-gray-400 text-xs">Made For</p>
            <Typography as="h5" className="text-text" size="heading5">
              {user.username || 'User'}
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
