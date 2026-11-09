'use client'

import { HistoryEntryRow } from '@entities/History'
import { usePlayerStore } from '@entities/Player'
import { TracksList, useLikedTracksCount } from '@entities/Track'
import { useI18n } from '@shared/i18n'
import { CollectionHeader, SectionHeader } from '@shared/ui'
import { useState } from 'react'
import { lc } from '../../lib/styles/lc'
import {
  DEMO_HISTORY,
  DEMO_ME,
  DEMO_TRACK_LIST,
} from '../../model/demo/demoData'
import { DEMO_TRACK_SETS } from '../../model/demo/demoSeeds'
import { useLandingCopy } from '../../model/useLandingCopy'
import { DemoFrame } from '../demo/DemoFrame'
import { DemoPlayerBar } from '../demo/DemoPlayerBar'
import { Abs, SceneShell } from './parts'

/** Scene "Loop": the player bar, Liked Songs and Recents — the web player's own blocks. */
export const SceneLoop = () => {
  const c = useLandingCopy()
  const { t } = useI18n()
  const play = usePlayerStore((state) => state.play)
  const [history, setHistory] = useState(DEMO_HISTORY)
  const { data: likedCount = 0 } = useLikedTracksCount()

  return (
    <SceneShell id="loop" labelKey="loop.play_save_return">
      <Abs w={900} x={60} y={64}>
        <h2 className={lc('h h80')}>
          <span className={lc('line')}>
            <span>
              {c('loop.play')}{' '}
              <span className={lc('hl')}>{c('loop.save')}</span>{' '}
              {c('loop.return')}
            </span>
          </span>
        </h2>
        <p className={lc('lede', 'mt-[18px]')} data-a="up">
          {c('loop.one_listening_loop_built_around_the_musi')}
        </p>
      </Abs>
      <Abs
        data-a="up"
        extra="text-right"
        markers="label d-only"
        w={260}
        x={1120}
        y={72}
      >
        {c('loop.interface_preview')}
      </Abs>
      <Abs data-a="win" h={552} markers="win" w={880} x={60} y={212}>
        <DemoFrame
          className="h-full p-4 max-[820px]:max-h-[52vh]"
          label={t('library.likedSongs')}
        >
          <div className="flex flex-col gap-5">
            <CollectionHeader
              coverUrl="/images/liked-songs.svg"
              meta={[t('common.songs.other', { count: likedCount })]}
              owner={DEMO_ME.username}
              showBack={false}
              title={t('library.likedSongs')}
              type={t('common.playlist')}
            />
            <TracksList
              onPlayTrack={(track) => play(track)}
              showDateAdded={false}
              tracks={[...DEMO_TRACK_SETS.liked]}
            />
          </div>
        </DemoFrame>
      </Abs>
      <Abs data-a="win" h={552} markers="win d-only" w={416} x={964} y={212}>
        <DemoFrame className="h-full p-5" label={t('recents.title')}>
          <SectionHeader title={t('recents.title')} />
          <ul className="flex flex-col">
            {history.map((entry) => (
              <HistoryEntryRow
                entry={entry}
                isRemoving={false}
                key={entry.id}
                onPlay={(trackId) => {
                  const track = DEMO_TRACK_LIST.find(
                    (item) => item.id === trackId,
                  )
                  if (track) play(track)
                }}
                onRemove={(trackId) =>
                  setHistory((list) =>
                    list.filter((item) => item.track.id !== trackId),
                  )
                }
              />
            ))}
          </ul>
        </DemoFrame>
      </Abs>
      <Abs data-a="win" h={88} markers="d-only" w={1270} x={60} y={776}>
        <DemoFrame className="rounded-2xl" label={t('queue.nowPlaying')}>
          <DemoPlayerBar />
        </DemoFrame>
      </Abs>
    </SceneShell>
  )
}
