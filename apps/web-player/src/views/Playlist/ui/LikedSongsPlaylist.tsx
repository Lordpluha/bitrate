'use client'

import { play, setPlaylist, setCurrentPlaylistName } from '@entities/Player'
import { useAppDispatch } from '@shared/hooks'
import { useLikedTracks } from '@shared/hooks/useLikedTracks'
import { ITrack } from '@shared/types'
import React, { useEffect } from 'react'
import { PlaylistHeader } from './PlaylistHeader'
import { Track, TracksList } from './TracksList'

interface TrackData {
  id: string
  title: string
  cover: string
  createdAt?: string
  updatedAt?: string
  artistId?: string
  duration?: number | null
  releaseDate?: string | null
  lyrics?: string | null
}

const mapToPlayerTrack = (track: TrackData): ITrack => ({
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

export const LikedSongsPlaylist: React.FC = () => {
  const dispatch = useAppDispatch()

  const { data, isPending } = useLikedTracks()
  const tracks = Array.isArray(data) ? data : []

  useEffect(() => {
    if (tracks.length > 0) {
      const iTracks = tracks.map(mapToPlayerTrack)
      dispatch(setPlaylist(iTracks))
      dispatch(setCurrentPlaylistName('Liked Songs'))
    }
  }, [tracks, dispatch])

  if (isPending) {
    return (
      <div className="h-full overflow-y-auto custom-scrollbar">
        <PlaylistHeader
          title="Liked Songs"
          type="Playlist"
          imageUrl="/images/liked-songs.jpg"
          author="Your Library"
          songsCount={0}
          tracksCount={0}
          duration="0 min"
        />
        <div className="flex justify-center items-center h-64">
          <div className="text-text">Loading liked songs...</div>
        </div>
      </div>
    )
  }

  const handlePlayTrack = (track: Track) => {
    dispatch(play(mapToPlayerTrack(track)))
  }

  const totalDuration = tracks.reduce(
    (acc, track) => acc + (track.duration || 0),
    0,
  )
  const durationMinutes = Math.floor(totalDuration / 60)
  const durationHours = Math.floor(durationMinutes / 60)
  const durationText =
    durationHours > 0
      ? `${durationHours} hr ${durationMinutes % 60} min`
      : `${durationMinutes} min`

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <PlaylistHeader
        title="Liked Songs"
        type="Playlist"
        imageUrl="/images/liked-songs.jpg"
        author="Your Library"
        songsCount={tracks.length}
        tracksCount={tracks.length}
        duration={durationText}
      />
      {tracks.length === 0 ? (
        <div className="text-white p-8">No liked tracks yet</div>
      ) : (
        <TracksList tracks={tracks} onPlayTrack={handlePlayTrack} />
      )}
    </div>
  )
}
