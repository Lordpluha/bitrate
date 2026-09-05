'use client'

import { useMemo, useState } from 'react'
import type { PlaylistWithTracks } from '@/entities/Playlist'
import { selectCompactLibrary, useSettingsStore } from '@/entities/Settings'
import { TracksList, useLikedTracks } from '@/entities/Track'
import { useAuth } from '@/shared/hooks'
import { useI18n } from '@/shared/i18n'
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
  const { data: likedTracks } = useLikedTracks(1, 1000, undefined, {
    staleTime: 5 * 60_000,
  })
  const [isEditing, setIsEditing] = useState(false)
  const compactLibrary = useSettingsStore(selectCompactLibrary)
  const [trackViewMode, setTrackViewMode] = useState<TrackViewMode>(
    compactLibrary ? 'compact' : 'list',
  )
  const tracks = playlist.tracks ?? []
  const likedTrackIds = useMemo(
    () => new Set((likedTracks ?? []).map((track) => track.id)),
    [likedTracks],
  )
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

  return (
    <>
      <PlaylistHeader
        author={ownerName}
        duration={getPlaylistDuration(tracks)}
        imageUrl={cover}
        title={playlist.title || t('common.playlist')}
        tracksCount={tracks.length}
        type={t('common.playlist')}
      />
      <PlaylistActionBar
        details={{
          cover,
          id: playlist.id,
          isOwner,
          ownerName: playlist.user?.username || t('common.unknown'),
          title: playlist.title || 'playlist',
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
          likedTrackIds={likedTrackIds}
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
          playlistTitle={playlist.title || 'playlist'}
        />
      )}
      {!isOwner && tracks.length === 0 && (
        <div className="px-6 py-10 text-text-subdued">
          {t('playlist.noTracks')}
        </div>
      )}
    </>
  )
}
