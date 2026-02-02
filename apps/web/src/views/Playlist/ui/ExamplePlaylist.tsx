'use client'

import { play, setPlaylist, setCurrentPlaylistName } from '@entities/Player'
import { useAppDispatch } from '@shared/hooks'
import { useTracks } from '@shared/hooks/useTracks'
import { ITrack } from '@shared/types'
import React, { useEffect } from 'react'
import { PlaylistHeader } from './PlaylistHeader'
import { Track, TracksList } from './TracksList'

export const ExamplePlaylist: React.FC = () => {
  const dispatch = useAppDispatch()

  const { data, isPending } = useTracks()
  const tracks = data?.data || []

  useEffect(() => {
    if (tracks && tracks.length > 0) {
      const iTracks: ITrack[] = tracks.map((track: any) => ({
        id: track.id,
        title: track.title,
        audioUrl: `${process.env.NEXT_PUBLIC_API_URL}api/v1/tracks/stream/${track.id}`,
        cover: track.cover,
        createdAt: track.createdAt,
        updatedAt: track.updatedAt || track.createdAt,
        artistId: track.artistId,
        duration: track.duration || 0,
        releaseDate: track.releaseDate || null,
        lyrics: track.lyrics || null
      }))
      dispatch(setPlaylist(iTracks))
      dispatch(setCurrentPlaylistName('All Tracks'))
    }
  }, [tracks, dispatch])

  if (isPending) {
    return (
      <div className='h-full overflow-y-auto custom-scrollbar'>
        <PlaylistHeader
          title='Loading...'
          type='Playlist'
          imageUrl='/images/default-playlist.jpg'
          author='Loading...'
          songsCount={0}
          tracksCount={0}
          duration='0 min'
        />
        <div className='flex justify-center items-center h-64'>
          <div className='text-text'>Loading tracks...</div>
        </div>
      </div>
    )
  }

  const handlePlayTrack = (track: Track) => {
    const iTrack: ITrack = {
      id: track.id,
      title: track.title,
      audioUrl: `${process.env.NEXT_PUBLIC_API_URL}api/v1/tracks/stream/${track.id}`,
      cover: track.cover,
      createdAt: track.createdAt || new Date().toISOString(),
      updatedAt: track.updatedAt || new Date().toISOString(),
      artistId: track.artistId || '',
      duration: track.duration || 0,
      releaseDate: track.releaseDate || null,
      lyrics: track.lyrics || null
    }
    dispatch(play(iTrack))
  }

  const totalDuration = tracks.reduce((acc: number, track: any) => acc + (track.duration || 0), 0)
  const durationMinutes = Math.floor(totalDuration / 60)
  const durationHours = Math.floor(durationMinutes / 60)
  const durationText = durationHours > 0
    ? `${durationHours} hr ${durationMinutes % 60} min`
    : `${durationMinutes} min`

  return (
    <div className='h-full overflow-y-auto custom-scrollbar'>
      <PlaylistHeader
        title='All Tracks'
        type='Playlist'
        imageUrl='/images/default-playlist.jpg'
        author='Music Library'
        songsCount={tracks.length}
        tracksCount={tracks.length}
        duration={durationText}
      />
      {tracks.length === 0 ? (
        <div className='text-white p-8'>No tracks available</div>
      ) : (
        <TracksList
          tracks={tracks}
          onPlayTrack={handlePlayTrack}
        />
      )}
    </div>
  )
}
