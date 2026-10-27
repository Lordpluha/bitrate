'use client'

import { useAuth } from '@shared/hooks'
import { FilterChips, LegalFooter } from '@shared/ui'
import { useMemo, useState } from 'react'
import { useI18n } from '@/shared/i18n'
import { greetingKey } from '@/widgets/MainPanel/model/greeting'
import {
  type HomeTabId,
  homeTabs,
} from '@/widgets/MainPanel/model/mainPanel.constants'
import { LibraryQuickGrid } from './LibraryQuickGrid'
import { PodcastsPanel } from './PodcastsPanel'
import { PopularArtists } from './PopularArtists'
import { RecentlyPlayed } from './RecentlyPlayed'
import { RecommendationsFeed } from './RecommendationsFeed'

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

  const hour = useMemo(() => new Date().getHours(), [])
  const name = user?.username || 'User'

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-7 px-4 pt-2 pb-3 md:px-8 md:py-6">
        <FilterChips
          ariaLabel={t('main.sections')}
          chips={localizedTabs}
          onChange={setActiveTab}
          value={activeTab}
        />
        {isAuthenticated && user && showsMusic ? (
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-xs font-semibold tracking-[1.2px] text-muted-foreground uppercase">
              {t('main.madeFor')} {name}
            </p>
            <h1 className="truncate text-2xl leading-[1.1] font-bold text-foreground md:text-[32px]">
              {t(greetingKey({ hour }), { name })}
            </h1>
          </div>
        ) : null}
        {activeTab === 'all' && <LibraryQuickGrid />}
        {showsMusic ? (
          <>
            <RecommendationsFeed />
            <PopularArtists />
            {activeTab === 'all' && <RecentlyPlayed />}
          </>
        ) : (
          <PodcastsPanel />
        )}
        <LegalFooter className="mt-5" />
      </div>
    </div>
  )
}
