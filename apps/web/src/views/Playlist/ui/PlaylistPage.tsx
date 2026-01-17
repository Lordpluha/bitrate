'use client'

import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@shared/hooks'
import { PlaylistHeader } from './PlaylistHeader'
import { TracksList, Track } from './TracksList'
import { useTracks } from '@shared/hooks/useTracks'
import { ITrack } from '@shared/types'
import {setPlaylist} from '@entities/Player'
import { play } from '@entities/Player'

interface PlaylistPageProps {
  playlistId: string
  onBack?: () => void
}

export const PlaylistPage: React.FC<PlaylistPageProps> = ({ playlistId, onBack }) => {
  const dispatch = useAppDispatch()
  const { data, isPending } = useTracks()
  const tracks = data?.data || []

  const tracksArray = Array.isArray(tracks) ? tracks : []

  useEffect(() => {
    if (tracksArray && tracksArray.length > 0) {
      const iTracks = tracksArray.map((track) => ({
        id: track.id,
        title: track.title,
        audioUrl: `${process.env.NEXT_PUBLIC_API_URL}tracks/stream/${track.id}`,
        cover: track.cover,
        createdAt: track.createdAt,
        artistId: track.artistId || '',
        artist: track.artist || 'Unknown Artist',
        duration: track.duration || 0,
        name: track.title,
        file: `${process.env.NEXT_PUBLIC_API_URL}tracks/stream/${track.id}`
      }))
      dispatch(setPlaylist(iTracks))
    }
  }, [tracksArray, dispatch])

  if (isPending) {
    return (
      <div className='h-full overflow-y-auto custom-scrollbar'>
        <PlaylistHeader
          onBack={onBack}
          title='Loading...'
          type='Playlist'
          imageUrl='/images/drive-cover-big.jpg'
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

  const handleTrackClick = (track: Track) => {
    const apiTrack = tracksArray.find((t) => t.id === track.id)
    if (apiTrack) {
      const iTrack: ITrack = {
        id: apiTrack.id,
        title: apiTrack.title,
        audioUrl: `${process.env.NEXT_PUBLIC_API_URL}tracks/stream/${apiTrack.id}`,
        artist: apiTrack.artist || 'Unknown Artist',
        duration: apiTrack.duration || 0,
        cover: apiTrack.cover,
        name: apiTrack.title,
        file: `${process.env.NEXT_PUBLIC_API_URL}tracks/stream/${apiTrack.id}`
      }
      dispatch(play(iTrack))
    }
  }

  const displayTracks = tracksArray.map((track) => ({
    id: track.id,
    name: track.title,
    artist: track.artist || 'Unknown Artist',
    album: track.album || 'Unknown Album',
    dateAdded: track.createdAt ? new Date(track.createdAt).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }) : 'Unknown',
    duration: `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}`
  }))

  return (
    <div className='h-full overflow-y-auto custom-scrollbar'>
      <PlaylistHeader
        onBack={onBack}
        title='All Tracks'
        type='Playlist'
        imageUrl='/images/drive-cover-big.jpg'
        author='Music Library'
        songsCount={0}
        tracksCount={displayTracks?.length || 0}
        duration='6 hr 30 min'
      />
      <TracksList 
        tracks={displayTracks}
        onTrackClick={handleTrackClick}
      />
    </div>
  )
}
