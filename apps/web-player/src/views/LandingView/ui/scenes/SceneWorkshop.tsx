'use client'

import { selectMusicPlayer, usePlayerStore } from '@entities/Player'
import { QueueTrackRow, TracksList } from '@entities/Track'
import { useI18n } from '@shared/i18n'
import { CollectionHeader, SectionHeader } from '@shared/ui'
import { useState } from 'react'
import { lc } from '../../lib/styles/lc'
import { DEMO_ME, DEMO_PLAYLISTS } from '../../model/demo/demoData'
import { DEMO_TRACK_SETS } from '../../model/demo/demoSeeds'
import type { LandingKey } from '../../model/messages/en'
import { useLandingCopy } from '../../model/useLandingCopy'
import { DemoFrame } from '../demo/DemoFrame'
import { Abs, SceneShell } from './parts'

/** How many upcoming tracks the queue column lists. */
const QUEUE_ROWS = 4

/** The scene's three points: icon id, title and line. */
const POINTS: readonly (readonly [string, LandingKey, LandingKey])[] = [
  ['#i-layers', 'workshop.build_playlists', 'workshop.build_playlists_meta'],
  ['#i-sliders', 'workshop.line_up_next', 'workshop.line_up_next_meta'],
  ['#i-play', 'workshop.play_any_row', 'workshop.play_any_row_meta'],
]

/** Queue column: what plays now and what comes after it in the player store. */
const DemoQueue = () => {
  const { t } = useI18n()
  const { currentTrack, currentTrackIndex, playlist, playPlaylist } =
    usePlayerStore(selectMusicPlayer)
  const [hidden, setHidden] = useState<readonly string[]>([])
  const upNext = playlist
    .map((track, position) => ({ position, track }))
    .slice(currentTrackIndex + 1)
    .filter(({ track }) => !hidden.includes(track.id))
    .slice(0, QUEUE_ROWS)

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <SectionHeader title={t('queue.title')} />
      <p className="px-2 text-xs font-semibold text-muted-foreground uppercase">
        {t('queue.nowPlaying')}
      </p>
      {currentTrack ? (
        <ul>
          <QueueTrackRow isActive track={currentTrack} />
        </ul>
      ) : null}
      <p className="mt-2 px-2 text-xs font-semibold text-muted-foreground uppercase">
        {t('queue.next')}
      </p>
      <ul>
        {upNext.map(({ position, track }, index) => (
          <QueueTrackRow
            index={index + 1}
            key={track.id}
            onPlay={() =>
              playPlaylist({
                currentPlaylistId: 'demo-p1',
                currentPlaylistName: 'Night Drive',
                startTrack: track,
                startTrackIndex: position,
                tracks: playlist,
              })
            }
            onRemove={() => setHidden((ids) => [...ids, track.id])}
            track={track}
          />
        ))}
      </ul>
    </div>
  )
}

/** Scene "Workshop": a real playlist page (header and track rows) beside the real queue. */
export const SceneWorkshop = () => {
  const c = useLandingCopy()
  const { t } = useI18n()
  const [tracks, setTracks] = useState(() => [...DEMO_TRACK_SETS.playlist])
  const playlist = DEMO_PLAYLISTS[0]

  return (
    <SceneShell id="workshop" labelKey="workshop.playlists_your_order">
      <Abs w={360} x={60} y={150}>
        <h2 className={lc('h h48')}>
          <span className={lc('line')}>
            <span>{c('workshop.playlists_in')}</span>
          </span>
          <span className={lc('line')}>
            <span className={lc('hl')}>{c('workshop.your_order')}</span>
          </span>
        </h2>
        <p className={lc('lede s', 'mt-[22px]')} data-a="up">
          {c('workshop.lede')}
        </p>
        <div className={lc('col d-only', 'mt-[34px] gap-[20px]')}>
          {POINTS.map(([icon, title, meta]) => (
            <div className={lc('row', 'items-start')} data-a="up" key={title}>
              <span className={lc('medal', 'w-[44px] h-[44px] rounded-[12px]')}>
                <svg aria-hidden="true" className={lc('i')}>
                  <use href={icon} />
                </svg>
              </span>
              <div>
                <p className={lc('t-title')}>{c(title)}</p>
                <p className={lc('t-meta')}>{c(meta)}</p>
              </div>
            </div>
          ))}
        </div>
      </Abs>
      <Abs data-a="win" h={720} markers="win" w={964} x={436} y={110}>
        <DemoFrame
          className="flex h-full gap-5 p-5 max-[820px]:max-h-[52vh] max-[820px]:p-4"
          label={playlist?.title ?? t('common.playlist')}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <CollectionHeader
              coverUrl={playlist?.cover}
              description={playlist?.description}
              meta={[t('common.songs.other', { count: tracks.length })]}
              owner={DEMO_ME.username}
              showBack={false}
              title={playlist?.title ?? ''}
              type={t('common.playlist')}
            />
            <TracksList
              layout="rows"
              onRemoveTrack={(trackId) =>
                setTracks((list) => list.filter(({ id }) => id !== trackId))
              }
              removable
              showDateAdded={false}
              tracks={tracks}
            />
          </div>
          <div className="w-80 shrink-0 border-l border-border pl-4 max-[820px]:hidden">
            <DemoQueue />
          </div>
        </DemoFrame>
      </Abs>
    </SceneShell>
  )
}
