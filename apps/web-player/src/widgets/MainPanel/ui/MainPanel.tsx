'use client'

import { Typography } from '@bitrate/ui-react'
import { useAuth } from '@shared/hooks'
import { useState } from 'react'
import { useI18n } from '@/shared/i18n'
import {
  type HomeTabId,
  homeTabs,
} from '@/widgets/MainPanel/model/mainPanel.constants'
import { Footer } from './Footer'
import { LibraryQuickGrid } from './LibraryQuickGrid'
import { PodcastsPanel } from './PodcastsPanel'
import { PopularArtists } from './PopularArtists'
import { RecentlyPlayed } from './RecentlyPlayed'
import { RecommendationsFeed } from './RecommendationsFeed'
import { Tabs } from './Tabs'

export const MainPanel = () => {
  const { t } = useI18n()
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<HomeTabId>('all')
  const showsMusic = activeTab !== 'podcasts'
  const localizedTabs = homeTabs.map((tab) => ({
    ...tab,
    label:
      tab.id === 'all'
        ? t('common.all')
        : tab.id === 'music'
          ? t('common.music')
          : t('common.podcasts'),
  }))

  return (
    <div className="h-full overflow-y-auto custom-scrollbar relative">
      <div className="absolute top-0 left-0 right-0 h-80 bg-linear-to-b from-hero-wash to-transparent pointer-events-none z-0" />
      <div className="relative z-10 px-4 py-4 sm:px-6">
        <Tabs
          onTabChange={(id) => setActiveTab(id as HomeTabId)}
          tabs={localizedTabs}
        />
        {activeTab === 'all' && <LibraryQuickGrid />}
        <div className="mt-6">
          {isAuthenticated && user && showsMusic ? (
            <div className="mb-8 min-w-0">
              <p className="text-text-subdued text-xs">{t('main.madeFor')}</p>
              <Typography as="h5" className="text-text" size="heading5">
                {user.username || 'User'}
              </Typography>
            </div>
          ) : null}
          {showsMusic ? (
            <>
              <RecommendationsFeed />
              <PopularArtists />
              {activeTab === 'all' && <RecentlyPlayed />}
            </>
          ) : (
            <PodcastsPanel />
          )}
          <Footer />
        </div>
      </div>
    </div>
  )
}
