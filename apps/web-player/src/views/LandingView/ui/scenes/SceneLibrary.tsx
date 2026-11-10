'use client'

import { useI18n } from '@shared/i18n'
import { FilterChips, MusicCardLg } from '@shared/ui'
import { LeftSidebar } from '@widgets/LeftSidebar'
import { useState } from 'react'
import { lc } from '../../lib/styles/lc'
import { DEMO_ARTISTS, DEMO_PLAYLISTS } from '../../model/demo/demoData'
import { useLandingCopy } from '../../model/useLandingCopy'
import { DemoFrame } from '../demo/DemoFrame'
import { Abs, SceneShell } from './parts'

type LibraryFilter = 'artists' | 'playlists'

/** The library grid: the player's filter chips over its cards. */
const DemoLibraryGrid = () => {
  const c = useLandingCopy()
  const { t } = useI18n()
  const [filter, setFilter] = useState<LibraryFilter>('playlists')
  const cards =
    filter === 'playlists'
      ? DEMO_PLAYLISTS.map(({ cover, id, title, _count }) => ({
          description: t('common.songs.other', { count: _count.tracks }),
          id,
          imageUrl: cover,
          isArtist: false,
          name: title,
        }))
      : DEMO_ARTISTS.slice(0, 4).map(({ avatar, id, username }) => ({
          description: t('common.artist'),
          id,
          imageUrl: avatar ?? undefined,
          isArtist: true,
          name: username,
        }))

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 p-6">
      <h1 className="text-[32px] leading-[1.1] font-bold">
        {t('library.title')}
      </h1>
      <FilterChips
        ariaLabel={t('library.filter')}
        chips={[
          { id: 'playlists', label: t('library.playlists') },
          { id: 'artists', label: c('library.artists') },
        ]}
        onChange={setFilter}
        value={filter}
      />
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => (
          <MusicCardLg key={card.id} {...card} />
        ))}
      </div>
    </div>
  )
}

/** Scene "Library": the player's library sidebar and its library page. */
export const SceneLibrary = () => {
  const c = useLandingCopy()
  const { t } = useI18n()
  return (
    <SceneShell id="library" labelKey="library.a_library_with_a_memory">
      <Abs w={760} x={48} y={80}>
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
        <p className={lc('lede', 'mt-[12px]')} data-a="up">
          {c('library.lede')}
        </p>
      </Abs>
      <Abs data-a="win" h={632} markers="win" w={1376} x={32} y={218}>
        <DemoFrame
          className="flex h-full max-[820px]:max-h-[56vh]"
          label={t('library.title')}
        >
          <div className="w-80 shrink-0 border-r border-border max-[820px]:w-full max-[820px]:border-0">
            <LeftSidebar />
          </div>
          <div className="contents max-[820px]:hidden">
            <DemoLibraryGrid />
          </div>
        </DemoFrame>
      </Abs>
    </SceneShell>
  )
}
