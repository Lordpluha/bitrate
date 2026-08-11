'use client'

import { ArtistLink } from '@entities/Artist'
import {
  selectCurrentTrack,
  selectIsPlaying,
  usePlayerStore,
} from '@entities/Player'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { useTrackContextMenuPosition } from '@entities/Track/models/useTrackContextMenuPosition'
import { DateUtils } from '@shared/utils/DateUtils'
import { cn } from '@spotify/ui-react'
import { TrackContextMenu } from './TrackContextMenu'
import { TrackPlayIndicator } from './TrackPlayIndicator'
import { TrackPrimaryInfo } from './TrackPrimaryInfo'
import { TrackRowActions } from './TrackRowActions'

interface TrackCardProps {
  track: TrackEntity
  index: number
  onPlayTrack?: (track: TrackEntity, index: number) => void
  onRemoveTrack?: (trackId: string) => void
  isLiked?: boolean
  isPlaybackContextActive?: boolean
  isPlaybackTrackActive?: boolean
  removable?: boolean
  viewMode?: 'compact' | 'list'
}

export const TrackCard = ({
  index,
  isLiked = false,
  isPlaybackContextActive = true,
  isPlaybackTrackActive = true,
  onPlayTrack,
  onRemoveTrack,
  removable = false,
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
        'group m-0 grid w-full min-w-0 border-0 items-center gap-4 rounded px-4 py-2 text-left hover:bg-surface focus-within:outline-2 focus-within:outline-offset-[-2px] focus-within:outline-white max-[1024px]:grid-cols-[minmax(0,1fr)_auto] max-[1024px]:gap-2 max-[1024px]:px-2',
        viewMode === 'compact'
          ? 'grid-cols-[32px_minmax(0,2fr)_minmax(140px,1.3fr)_minmax(160px,1.5fr)_minmax(140px,1.4fr)_140px]'
          : 'grid-cols-[32px_minmax(0,4fr)_minmax(160px,2fr)_minmax(140px,2fr)_140px]',
      )}
      onContextMenu={contextMenu.openFromPointer}
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
        <div className="text-sm text-text-subdued truncate max-[1024px]:hidden">
          <ArtistLink artistId={track.artistId} />
        </div>
      )}
      <div className="text-sm text-text-subdued truncate max-[1024px]:hidden">
        Unknown Album
      </div>
      <div className="text-sm text-text-subdued max-[1024px]:hidden">
        {track.createdAt ? DateUtils.formatDate(track.createdAt) : 'Unknown'}
      </div>
      <TrackRowActions
        isLiked={isLiked}
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
    </fieldset>
  )
}
