'use client'

import { FollowArtistButton } from '@entities/Artist'
import { SearchPage } from '@features/Search'
import { useI18n } from '@shared/i18n'
import { MusicCardLg, SectionHeader } from '@shared/ui'
import { Suspense } from 'react'
import { lc } from '../../lib/styles/lc'
import { DEMO_ARTISTS } from '../../model/demo/demoData'
import { useLandingCopy } from '../../model/useLandingCopy'
import { DemoFrame } from '../demo/DemoFrame'
import { Abs, SceneShell } from './parts'

/** How many related artists the side column shows. */
const RELATED_ARTISTS = 4

/** Scene "Discover": Search's browse grid and the artists fans also like, with Follow. */
export const SceneDiscover = () => {
  const c = useLandingCopy()
  const { t } = useI18n()
  return (
    <SceneShell id="discover" labelKey="discover.follow_the_sound">
      <Abs w={640} x={48} y={98}>
        <div className={lc('eyebrow', 'mb-[14px]')} data-a="up">
          {c('discover.browse_then_go_deeper')}
        </div>
        <h2 className={lc('h h54')}>
          <span className={lc('line')}>
            <span>
              {c('discover.follow_the')}{' '}
              <span className={lc('hl')}>{c('discover.sound')}</span>
            </span>
          </span>
        </h2>
        <p className={lc('lede s', 'mt-[12px]')} data-a="up">
          {c('discover.lede')}
        </p>
      </Abs>
      <Abs data-a="win" h={430} markers="win" w={900} x={48} y={300}>
        <DemoFrame
          className="h-full max-[820px]:max-h-[56vh]"
          label={t('search.browseAll')}
        >
          {/* Search reads the URL's query; the landing has none, so it shows Browse all */}
          <Suspense>
            <SearchPage />
          </Suspense>
        </DemoFrame>
      </Abs>
      <Abs data-a="win" h={600} markers="win d-only" w={420} x={972} y={130}>
        <DemoFrame className="h-full p-6" label={t('artist.fansAlsoLike')}>
          <SectionHeader title={t('artist.fansAlsoLike')} />
          <div className="grid grid-cols-2 gap-4">
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
