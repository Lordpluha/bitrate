'use client'
import { cn } from '@bitrate/ui-react'
import { selectCompactLibrary, useSettingsStore } from '@entities/Settings'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { Clock } from 'lucide-react'
import { useMemo } from 'react'
import { useI18n } from '@/shared/i18n'
import { useTrackAlbums } from '../api/client/trackAlbums'
import { TrackCard } from './TrackCard'
import { TRACK_TABLE_COLUMNS } from './trackTableColumns'

interface TracksListProps {
  activeTrackId?: string
  likedTrackIds?: Iterable<string>
  tracks: TrackEntity[]
  isPlaybackContextActive?: boolean
  onPlayTrack?: (track: TrackEntity, index: number) => void
  onRemoveTrack?: (trackId: string) => void
  removable?: boolean
  viewMode?: 'compact' | 'list'
}

export const TracksList = ({
  activeTrackId,
  likedTrackIds: providedLikedTrackIds,
  isPlaybackContextActive = true,
  onPlayTrack,
  onRemoveTrack,
  removable = false,
  tracks,
  viewMode: viewModeProp,
}: TracksListProps) => {
  const { t } = useI18n()
  const compactLibrary = useSettingsStore(selectCompactLibrary)
  const viewMode = viewModeProp ?? (compactLibrary ? 'compact' : 'list')
  const trackIds = useMemo(() => tracks.map((track) => track.id), [tracks])
  const { data: albums } = useTrackAlbums(trackIds)
  const likedTrackIds = useMemo(
    () =>
      providedLikedTrackIds
        ? new Set(providedLikedTrackIds)
        : new Set<string>(),
    [providedLikedTrackIds],
  )

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          'grid h-9 items-center border-b border-border text-xs text-muted-foreground max-[1024px]:hidden',
          TRACK_TABLE_COLUMNS[viewMode],
        )}
      >
        <div className="text-center">#</div>
        <div>{t('tracks.title')}</div>
        {viewMode === 'compact' && <div>{t('tracks.artist')}</div>}
        <div>{t('tracks.album')}</div>
        <div>{t('tracks.dateAdded')}</div>
        <div className="flex justify-end">
          <Clock aria-hidden="true" size={16} />
        </div>
      </div>

      <div className="flex flex-col">
        {tracks.map((track, index) => (
          <TrackCard
            album={albums?.get(track.id) ?? null}
            index={index}
            isLiked={likedTrackIds.has(track.id)}
            isPlaybackContextActive={isPlaybackContextActive}
            isPlaybackTrackActive={
              activeTrackId === undefined || activeTrackId === track.id
            }
            key={track.id}
            onPlayTrack={onPlayTrack}
            onRemoveTrack={onRemoveTrack}
            removable={removable}
            track={track}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  )
}
