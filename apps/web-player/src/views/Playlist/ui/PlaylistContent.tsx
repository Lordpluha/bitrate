'use client'

import { useMemo, useState } from 'react'
import type { PlaylistWithTracks } from '@/entities/Playlist'
import { type TrackEntity, TracksList, useLikedTracks } from '@/entities/Track'
import { useAuth } from '@/shared/hooks'
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
  const { user } = useAuth()
  const { data: likedTracks } = useLikedTracks(1, 1000, undefined, {
    staleTime: 5 * 60_000,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [trackViewMode, setTrackViewMode] = useState<TrackViewMode>('list')
  const tracks = useMemo(
    () => ((playlist.tracks ?? []) as TrackEntity[]).filter(Boolean),
    [playlist.tracks],
  )
  const likedTrackIds = useMemo(
    () => new Set((likedTracks ?? []).map((track) => track.id)),
    [likedTracks],
  )
  const isOwner = Boolean(
    playlist.user?.id && user?.id && playlist.user.id === user.id,
  )
  const cover = getPlaylistCover(playlist.cover, tracks)
  const ownerName = playlist.user?.username || 'Unknown'
  const playback = usePlaylistPlayback({
    playlistId: playlist.id,
    playlistTitle: playlist.title || 'Playlist',
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
        title={playlist.title || 'Playlist'}
        tracksCount={tracks.length}
        type="Playlist"
      />
      <PlaylistActionBar
        details={{
          cover,
          id: playlist.id,
          isOwner,
          ownerName: playlist.user?.username || 'Unknown Artist',
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
          activeTrackIndex={playback.currentTrackIndex}
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
          No tracks in this playlist.
        </div>
      )}
    </>
  )
}
