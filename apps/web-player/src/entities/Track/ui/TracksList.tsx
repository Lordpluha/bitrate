'use client'
import { cn } from '@bitrate/ui-react'
import { selectCompactLibrary, useSettingsStore } from '@entities/Settings'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { Clock } from 'lucide-react'
import { useMemo } from 'react'
import { useI18n } from '@/shared/i18n'
import { useTrackAlbums } from '../api/client/trackAlbums'
import { TrackCard } from './TrackCard'
import {
  TRACK_TABLE_COLUMNS,
  TRACK_TABLE_COLUMNS_WITHOUT_DATE,
} from './trackTableColumns'

interface TracksListProps {
  activeTrackId?: string
  tracks: TrackEntity[]
  isPlaybackContextActive?: boolean
  onPlayTrack?: (track: TrackEntity, index: number) => void
  onRemoveTrack?: (trackId: string) => void
  removable?: boolean
  /** Albums leave out the Date added column. */
  showDateAdded?: boolean
  viewMode?: 'compact' | 'list'
}

export const TracksList = ({
  activeTrackId,
  isPlaybackContextActive = true,
  onPlayTrack,
  onRemoveTrack,
  removable = false,
  showDateAdded = true,
  tracks,
  viewMode: viewModeProp,
}: TracksListProps) => {
  const { t } = useI18n()
  const compactLibrary = useSettingsStore(selectCompactLibrary)
  const viewMode = viewModeProp ?? (compactLibrary ? 'compact' : 'list')
  const trackIds = useMemo(() => tracks.map((track) => track.id), [tracks])
  const { data: albums } = useTrackAlbums(trackIds)
  const columns = (
    showDateAdded ? TRACK_TABLE_COLUMNS : TRACK_TABLE_COLUMNS_WITHOUT_DATE
  )[viewMode]

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          'grid h-9 items-center border-b border-border px-2 text-xs text-muted-foreground max-[1024px]:hidden',
          columns,
        )}
      >
        <div className="text-center">#</div>
        <div>{t('tracks.title')}</div>
        {viewMode === 'compact' && <div>{t('tracks.artist')}</div>}
        <div>{t('tracks.album')}</div>
        {showDateAdded ? <div>{t('tracks.dateAdded')}</div> : null}
        <div className="flex justify-end">
          <Clock aria-hidden="true" size={16} />
        </div>
      </div>

      <div className="flex flex-col">
        {tracks.map((track, index) => (
          <TrackCard
            album={albums?.get(track.id) ?? null}
            index={index}
            isPlaybackContextActive={isPlaybackContextActive}
            isPlaybackTrackActive={
              activeTrackId === undefined || activeTrackId === track.id
            }
            key={track.id}
            onPlayTrack={onPlayTrack}
            onRemoveTrack={onRemoveTrack}
            removable={removable}
            showDateAdded={showDateAdded}
            track={track}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  )
}
