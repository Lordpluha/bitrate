'use client'

import { HistoryEntryRow } from '@entities/History'
import { selectMusicPlayer, usePlayerStore } from '@entities/Player'
import { QueueTrackRow, TracksList, useLikedTracksCount } from '@entities/Track'
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
import { Abs, SceneShell, TryInPlayer } from './parts'

/** How many upcoming tracks the queue column lists. */
const QUEUE_ROWS = 5

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

/**
 * Scene "Loop": the whole listening loop in the web player's own blocks — Liked Songs to save
 * into, the queue to line up, Recents to come back through, and the player bar.
 */
export const SceneLoop = () => {
  const c = useLandingCopy()
  const { t } = useI18n()
  const play = usePlayerStore((state) => state.play)
  const [history, setHistory] = useState(DEMO_HISTORY)
  const { data: likedCount = 0 } = useLikedTracksCount()

  return (
    <SceneShell id="loop" labelKey="loop.play_save_return">
      <Abs w={1000} x={60} y={70}>
        <h2 className={lc('h h80')}>
          <span className={lc('line')}>
            <span>
              {c('loop.play')}{' '}
              <span className={lc('hl')}>{c('loop.save')}</span>{' '}
              {c('loop.return')}
            </span>
          </span>
        </h2>
        <p className={lc('lede s', 'mt-[14px]')} data-a="up">
          {c('loop.lede')}
        </p>
      </Abs>
      <Abs data-a="up" extra="text-right" w={300} x={1080} y={150}>
        <TryInPlayer />
      </Abs>
      <Abs
        data-a="win"
        h={552}
        markers="win scene-block"
        w={620}
        x={60}
        y={212}
      >
        <DemoFrame className="h-full p-4" label={t('library.likedSongs')}>
          <div className="flex flex-col gap-5">
            <CollectionHeader
              coverUrl="/images/liked-songs.svg"
              meta={[t('common.songs.other', { count: likedCount })]}
              owner={DEMO_ME.username}
              title={t('library.likedSongs')}
              type={t('common.playlist')}
            />
            <TracksList
              layout="rows"
              onPlayTrack={(track) => play(track)}
              showDateAdded={false}
              tracks={[...DEMO_TRACK_SETS.liked]}
            />
          </div>
        </DemoFrame>
      </Abs>
      <Abs data-a="win" h={552} markers="win d-only" w={330} x={696} y={212}>
        <DemoFrame className="h-full p-4" label={t('queue.title')}>
          <DemoQueue />
        </DemoFrame>
      </Abs>
      <Abs data-a="win" h={552} markers="win d-only" w={338} x={1042} y={212}>
        <DemoFrame className="h-full p-4" label={t('recents.title')}>
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
      <Abs data-a="win" h={88} markers="d-only" w={1320} x={60} y={776}>
        <DemoFrame className="rounded-2xl" label={t('queue.nowPlaying')}>
          <DemoPlayerBar />
        </DemoFrame>
      </Abs>
    </SceneShell>
  )
}
