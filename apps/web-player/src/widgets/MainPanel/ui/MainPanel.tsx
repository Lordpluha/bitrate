'use client'

import { useAuth } from '@shared/hooks'
import { Typography } from '@spotify/ui-react'
import { Footer } from './Footer'
import { LibraryQuickGrid } from './LibraryQuickGrid'
import { NewAlbums } from './NewAlbums'
import { PopularPlaylists } from './PopularPlaylists'
import { RecentlyPlayed } from './RecentlyPlayed'
import { Tabs } from './Tabs'

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
      <div className="relative z-10 px-4 py-4 sm:px-6">
        <Tabs tabs={tabs} />
        <LibraryQuickGrid />
        <div className="mt-6">
          {isAuthenticated && user ? (
            <div className="mb-8 min-w-0">
              <p className="text-text-subdued text-xs">Made For</p>
              <Typography as="h5" className="text-text" size="heading5">
                {user.username || 'User'}
              </Typography>
            </div>
          ) : null}
          <PopularPlaylists />
          <NewAlbums />
          <RecentlyPlayed />
          <Footer />
        </div>
      </div>
    </div>
  )
}
