'use client'

import { play, setPlaylist, setCurrentPlaylistName } from '@entities/Player'
import { useAppDispatch } from '@shared/hooks'
import { useQuery } from '@shared/api'

import React, { useEffect } from 'react'
import { PlaylistHeader } from './PlaylistHeader'
import { Track, TracksList } from './TracksList'
import { TrackEntity } from '@entities/Track/models/schema/Track.entity'

interface PlaylistPageProps {
  playlistId: string
}



const mapToPlayerTrack = (track: TrackEntity): TrackEntity => ({
  id: track.id,
  title: track.title,
  audioUrl: `${process.env.NEXT_PUBLIC_API_URL}api/v1/tracks/stream/${track.id}`,
  cover: track.cover,
  createdAt: track.createdAt || new Date().toISOString(),
  updatedAt: track.updatedAt || new Date().toISOString(),
  artistId: track.artistId || '',
  duration: track.duration || 0,
  releaseDate: track.releaseDate || null,
  lyrics: track.lyrics || null,
})

export const PlaylistPage: React.FC<PlaylistPageProps> = ({ playlistId }) => {
  const dispatch = useAppDispatch()

  const {
    data: playlist,
    isPending: loadingPlaylist,
    error,
  } = useQuery(
    'get',
    '/api/v1/playlists/{id}',
    {
      params: {
        path: {
          id: playlistId,
        },
      },
    },
    {
      enabled: !!playlistId,
    },
  )

  const tracks = (playlist as any)?.tracks.map(mapToPlayerTrack)

  useEffect(() => {
    if (tracks?.length > 0) {
      dispatch(setPlaylist(tracks))
      dispatch(setCurrentPlaylistName(playlist?.title || 'Playlist'))
    }
  }, [tracks, playlist?.title, dispatch])

  if (loadingPlaylist) {
    return (
      <div className="h-full overflow-y-auto custom-scrollbar">
        <PlaylistHeader
          title="Loading..."
          type="Playlist"
          imageUrl="/images/default-playlist.jpg"
          author="Loading..."
          songsCount={0}
          tracksCount={0}
          duration="0 min"
        />
        <div className="flex justify-center items-center h-64">
          <div className="text-text">Loading playlist...</div>
        </div>
      </div>
    )
  }

  if (!loadingPlaylist && !playlist) {
    return (
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="flex justify-center items-center h-64">
          <div className="text-text">Playlist not found</div>
        </div>
      </div>
    )
  }

  const coverUrl = playlist?.cover || '/images/default-playlist.jpg'

  const totalDuration = (playlist as any)?.tracks.reduce(
    (acc: number, track: any) => acc + (track.duration || 0),
    0,
  )
  const durationMinutes = Math.floor(totalDuration / 60)
  const durationHours = Math.floor(durationMinutes / 60)
  const durationText =
    durationHours > 0
      ? `${durationHours} hr ${durationMinutes % 60} min`
      : `${durationMinutes} min`

  const handlePlayTrack = (track: Track) => {
    dispatch(play(mapToPlayerTrack(track)))
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <PlaylistHeader
        title={playlist?.title || 'Playlist'}
        type="Playlist"
        imageUrl={coverUrl}
        author={(playlist as any).user?.username || 'Unknown'}
        songsCount={tracks.length}
        tracksCount={tracks.length}
        duration={durationText}
      />
      {tracks.length === 0 ? (
        <div className="text-white p-8">No tracks in this playlist</div>
      ) : (
        <TracksList tracks={tracks} onPlayTrack={handlePlayTrack} />
      )}
    </div>
  )
}
