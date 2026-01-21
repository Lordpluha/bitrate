'use client'

import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@shared/hooks'
import { PlaylistHeader } from './PlaylistHeader'
import { TracksList, Track } from './TracksList'
import { useTracks } from '@shared/hooks/useTracks'
import { ITrack } from '@shared/types'
import {setPlaylist} from '@entities/Player'
import { play } from '@entities/Player'


export const PlaylistPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { data, isPending } = useTracks()
  
  const tracks = (data as any)?.data || data || []
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
        artist: (track as any).artist || 'Unknown Artist',
        duration: (track as any).duration || 0,
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

  const handlePlayTrack = (track: Track) => {
    const iTrack: ITrack = {
      id: track.id,
      title: track.title,
      audioUrl: `${process.env.NEXT_PUBLIC_API_URL}tracks/stream/${track.id}`,
      cover: track.cover,
      createdAt: track.createdAt || new Date().toISOString(),
      artistId: track.artistId || '',
      artist: (track as any).artist?.name || (track as any).artist || 'Unknown Artist',
      duration: (track as any).duration || 0,
      name: track.title,
      file: `${process.env.NEXT_PUBLIC_API_URL}tracks/stream/${track.id}`
    }
    dispatch(play(iTrack))
  }

  return (
    <div className='h-full overflow-y-auto custom-scrollbar'>
      <PlaylistHeader
        title='All Tracks'
        type='Playlist'
        imageUrl='/images/drive-cover-big.jpg'
        author='Music Library'
        songsCount={0}
        tracksCount={tracksArray?.length || 0}
        duration='6 hr 30 min'
      />
      <TracksList 
        tracks={tracksArray}
        onPlayTrack={handlePlayTrack}
      />
    </div>
  )
}
