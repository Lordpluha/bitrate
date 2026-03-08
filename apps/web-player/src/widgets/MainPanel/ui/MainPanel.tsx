'use client'

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

  return (
    <div className="h-full overflow-y-auto custom-scrollbar relative">
      <div className="absolute top-0 left-0 right-0 h-80 bg-linear-to-b from-purple-800 to-transparent pointer-events-none z-0" />
      <div className="relative z-10 py-4 px-6">
        <Tabs tabs={tabs} />
        <LikedPlaylist />
        <div className="mt-6">
          {isAuthenticated && user ? (
            <div className="min-w-[280px] mb-8">
              <p className="text-text-subdued text-xs">Made For</p>
              <Typography as="h5" size="heading5" className="text-text">
                {user.username || 'User'}
              </Typography>
            </div>
          ) : null}
          <PopularPlaylists />
          <PopularArtists />
          <Footer />
        </div>
      </div>
    </div>
  )
}
