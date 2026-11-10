'use client'

import { FollowArtistButton } from '@entities/Artist'
import { SearchPage } from '@features/Search'
import { useI18n } from '@shared/i18n'
import { MusicCardLg, SectionHeader } from '@shared/ui'
import { LeftSidebar } from '@widgets/LeftSidebar'
import { Suspense } from 'react'
import { lc } from '../../lib/styles/lc'
import { DEMO_ARTISTS } from '../../model/demo/demoData'
import { useLandingCopy } from '../../model/useLandingCopy'
import { DemoFrame } from '../demo/DemoFrame'
import { Abs, SceneShell, TryInPlayer } from './parts'

/** How many related artists the side column shows. */
const RELATED_ARTISTS = 4

/**
 * Scene "Library": what you keep and what you find next — the player's library sidebar, Search's
 * Browse all, and the artists fans also like, with Follow.
 */
export const SceneLibrary = () => {
  const c = useLandingCopy()
  const { t } = useI18n()
  return (
    <SceneShell id="library" labelKey="library.a_library_with_a_memory">
      <Abs w={900} x={48} y={80}>
        <div className={lc('eyebrow', 'mb-[14px]')} data-a="up">
          {c('library.your_collection_connected')}
        </div>
        <h2 className={lc('h h56')}>
          <span className={lc('line')}>
            <span>
              {c('library.a_library_with')}{' '}
              <span className={lc('hl')}>{c('library.a_memory')}</span>
            </span>
          </span>
        </h2>
        <p className={lc('lede s', 'mt-[12px]')} data-a="up">
          {c('library.lede')}
        </p>
      </Abs>
      <Abs data-a="up" extra="text-right" w={300} x={1080} y={160}>
        <TryInPlayer />
      </Abs>
      <Abs data-a="win" h={600} markers="win d-only" w={360} x={48} y={230}>
        <DemoFrame className="h-full" label={t('library.title')}>
          <LeftSidebar />
        </DemoFrame>
      </Abs>
      <Abs
        data-a="win"
        h={600}
        markers="win scene-block"
        w={600}
        x={424}
        y={230}
      >
        <DemoFrame
          /* the genre grid picks its columns from the window's width; in this frame three fit */
          className="custom-scrollbar h-full overflow-y-auto [&_.grid]:grid-cols-3!"
          label={t('search.browseAll')}
        >
          {/* Search reads the URL's query; the landing has none, so it shows Browse all */}
          <Suspense>
            <SearchPage />
          </Suspense>
        </DemoFrame>
      </Abs>
      <Abs data-a="win" h={600} markers="win d-only" w={352} x={1040} y={230}>
        <DemoFrame className="h-full p-5" label={t('artist.fansAlsoLike')}>
          <SectionHeader title={t('artist.fansAlsoLike')} />
          <div className="grid grid-cols-2 gap-3">
            {DEMO_ARTISTS.slice(2, 2 + RELATED_ARTISTS).map((artist) => (
              <div className="flex min-w-0 flex-col gap-2" key={artist.id}>
                <MusicCardLg
                  description={t('common.artist')}
                  id={artist.id}
                  imageUrl={artist.avatar ?? undefined}
                  isArtist
                  name={artist.username}
                />
                <FollowArtistButton
                  artistId={artist.id}
                  artistName={artist.username}
                  className="w-full"
                  size="sm"
                />
              </div>
            ))}
          </div>
        </DemoFrame>
      </Abs>
    </SceneShell>
  )
}
