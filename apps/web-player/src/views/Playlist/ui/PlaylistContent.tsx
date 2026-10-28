'use client'

import { StateMessage } from '@shared/ui'
import { ListMusic } from 'lucide-react'
import { useState } from 'react'
import type { PlaylistWithTracks } from '@/entities/Playlist'
import { selectCompactLibrary, useSettingsStore } from '@/entities/Settings'
import { TracksList } from '@/entities/Track'
import { useAuth } from '@/shared/hooks'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'
import type { TrackViewMode } from '@/views/Playlist/model/playlist.types'
import { getPlaylistCover } from '@/views/Playlist/model/playlist.utils'
import { usePlaylistActions } from '@/views/Playlist/model/usePlaylistActions'
import { usePlaylistPlayback } from '@/views/Playlist/model/usePlaylistPlayback'
import { PlaylistActionBar } from '@/views/Playlist/ui/PlaylistActionBar'
import { PlaylistEditForm } from '@/views/Playlist/ui/PlaylistEditForm'
import { PlaylistHeader } from '@/views/Playlist/ui/PlaylistHeader'
import { PlaylistTrackFinder } from '@/views/Playlist/ui/PlaylistTrackFinder'
import { getPlaylistDuration } from '@/views/Playlist/utils/getPlaylistDuration'

type PlaylistContentProps = {
  playlist: PlaylistWithTracks
}

export const PlaylistContent = ({ playlist }: PlaylistContentProps) => {
  const { t } = useI18n()
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const compactLibrary = useSettingsStore(selectCompactLibrary)
  const [trackViewMode, setTrackViewMode] = useState<TrackViewMode>(
    compactLibrary ? 'compact' : 'list',
  )
  const tracks = playlist.tracks ?? []
  const isOwner = Boolean(
    playlist.user?.id && user?.id && playlist.user.id === user.id,
  )
  const cover = getPlaylistCover(playlist.cover, tracks)
  const ownerName = playlist.user?.username || t('common.unknown')
  const playback = usePlaylistPlayback({
    playlistId: playlist.id,
    playlistTitle: playlist.title || t('common.playlist'),
    tracks,
  })
  const actions = usePlaylistActions({
    playlistId: playlist.id,
    playlistTitle: playlist.title || 'playlist',
    tracks,
  })

  const isEmpty = tracks.length === 0

  return (
    <>
      {/* The design's empty and finder phone frames drop the hero for the message or search. */}
      <div className={isEmpty ? 'max-md:hidden' : undefined}>
        <PlaylistHeader
          author={ownerName}
          duration={getPlaylistDuration(tracks)}
          imageUrl={cover}
          title={playlist.title || t('common.playlist')}
          tracksCount={tracks.length}
          type={playlist.isPublic ? t('playlist.public') : t('common.playlist')}
        />
      </div>
      <PlaylistActionBar
        details={{
          id: playlist.id,
          isOwner,
          title: playlist.title || t('playlist.fallbackTitle'),
          tracksCount: tracks.length,
        }}
        onDelete={actions.deletePlaylist}
        onEdit={() => setIsEditing(true)}
        playback={playback}
        view={{ onChange: setTrackViewMode, value: trackViewMode }}
      />
      <PlaylistEditForm
        isOpen={isOwner && isEditing}
        onClose={() => setIsEditing(false)}
        playlist={playlist}
      />
      {tracks.length > 0 && (
        <TracksList
          activeTrackId={playback.currentTrackId}
          isPlaybackContextActive={playback.isActive}
          onPlayTrack={playback.playTrack}
          onRemoveTrack={isOwner ? actions.removeTrack : undefined}
          removable={isOwner}
          tracks={tracks}
          viewMode={trackViewMode}
        />
      )}
      {isOwner && (
        <PlaylistTrackFinder
          addingTrackId={actions.addingTrackId}
          existingTrackIds={actions.existingTrackIds}
          onAddTrack={actions.addTrack}
          playlistTitle={playlist.title || t('playlist.fallbackTitle')}
        />
      )}
      {!isOwner && isEmpty && (
        <StateMessage
          description={t('playlist.findDescription')}
          icon={ListMusic}
          primary={{ href: ROUTES.search(), label: t('playlist.searchTracks') }}
          title={t('playlist.noTracks')}
        />
      )}
    </>
  )
}
