'use client'

import { cn } from '@bitrate/ui-react'
import { ArtistLink } from '@entities/Artist'
import {
  selectCurrentTrack,
  selectIsPlaying,
  usePlayerStore,
} from '@entities/Player'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { useTrackContextMenuPosition } from '@entities/Track/models/useTrackContextMenuPosition'
import { ROUTES } from '@shared/routes'
import { DateUtils } from '@shared/utils/DateUtils'
import Link from 'next/link'
import type { TrackAlbum } from '../api/client/trackAlbums'
import { TrackContextMenu } from './TrackContextMenu'
import { TrackPlayIndicator } from './TrackPlayIndicator'
import { TrackPrimaryInfo } from './TrackPrimaryInfo'
import { TrackRowActions } from './TrackRowActions'
import {
  TRACK_TABLE_COLUMNS,
  TRACK_TABLE_COLUMNS_WITHOUT_DATE,
} from './trackTableColumns'

interface TrackCardProps {
  /** The album the row links to; null for a single or while albums load. */
  album?: TrackAlbum | null
  track: TrackEntity
  index: number
  onPlayTrack?: (track: TrackEntity, index: number) => void
  onRemoveTrack?: (trackId: string) => void
  isPlaybackContextActive?: boolean
  isPlaybackTrackActive?: boolean
  removable?: boolean
  showDateAdded?: boolean
  viewMode?: 'compact' | 'list'
}

export const TrackCard = ({
  album = null,
  index,
  isPlaybackContextActive = true,
  isPlaybackTrackActive = true,
  onPlayTrack,
  onRemoveTrack,
  removable = false,
  showDateAdded = true,
  track,
  viewMode = 'list',
}: TrackCardProps) => {
  const currentTrack = usePlayerStore(selectCurrentTrack)
  const isPlaying = usePlayerStore(selectIsPlaying)
  const play = usePlayerStore((state) => state.play)
  const addToQueue = usePlayerStore((state) => state.addToQueue)
  const togglePlay = usePlayerStore((state) => state.togglePlay)
  const contextMenu = useTrackContextMenuPosition()
  const isCurrentTrack =
    isPlaybackContextActive &&
    isPlaybackTrackActive &&
    currentTrack?.id === track.id
  const handlePlayTrack = (track: TrackEntity) => {
    if (isCurrentTrack) {
      togglePlay()
      return
    }

    if (onPlayTrack) {
      onPlayTrack(track, index)
      return
    }

    play(track)
  }

  return (
    <fieldset
      aria-label={track.title}
      className={cn(
        'group m-0 w-full min-w-0 rounded-lg border-0 p-0 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-[-2px] has-[:focus-visible]:outline-ring',
        isCurrentTrack ? 'bg-secondary' : 'hover:bg-surface',
      )}
      onContextMenu={contextMenu.openFromPointer}
    >
      <div
        className={cn(
          'grid min-h-17 items-center px-2 py-1.5 text-left max-[1024px]:min-h-16 max-[1024px]:grid-cols-[minmax(0,1fr)_auto] max-[1024px]:gap-3 max-[1024px]:px-0 max-[1024px]:py-2',
          (showDateAdded
            ? TRACK_TABLE_COLUMNS
            : TRACK_TABLE_COLUMNS_WITHOUT_DATE)[viewMode],
        )}
      >
        <TrackPlayIndicator
          index={index}
          isCurrent={isCurrentTrack}
          isPlaying={isPlaying}
          onClick={() => handlePlayTrack(track)}
          title={track.title}
        />

        <TrackPrimaryInfo
          isCurrent={isCurrentTrack}
          onClick={() => handlePlayTrack(track)}
          onKeyDown={contextMenu.openFromKeyboard}
          track={track}
          viewMode={viewMode}
        />

        {viewMode === 'compact' && (
          <div className="truncate pr-4 text-[13px] text-muted-foreground max-[1024px]:hidden">
            <ArtistLink artistId={track.artistId} />
          </div>
        )}
        <div className="truncate pr-4 text-[13px] text-muted-foreground max-[1024px]:hidden">
          {album ? (
            <Link
              className="hover:text-foreground hover:underline"
              href={ROUTES.album(album.id)}
            >
              {album.title}
            </Link>
          ) : null}
        </div>
        {showDateAdded ? (
          <div className="truncate text-xs text-muted-foreground max-[1024px]:hidden">
            {track.createdAt
              ? DateUtils.formatDate(track.createdAt)
              : 'Unknown'}
          </div>
        ) : null}
        <TrackRowActions
          onRemove={() => onRemoveTrack?.(track.id)}
          removable={removable}
          track={track}
        />
        {contextMenu.position ? (
          <TrackContextMenu
            isPlaying={isCurrentTrack && isPlaying}
            onAddToQueue={() => addToQueue(track)}
            onClose={contextMenu.close}
            onPlay={() => handlePlayTrack(track)}
            onRemove={removable ? () => onRemoveTrack?.(track.id) : undefined}
            position={contextMenu.position}
          />
        ) : null}
      </div>
    </fieldset>
  )
}
