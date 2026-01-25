'use client'

import { play, setPlaylist } from '@entities/Player'
import { useAppDispatch } from '@shared/hooks'
import { useTracks } from '@shared/hooks/useTracks'
import { ITrack } from '@shared/types'
import React, { useEffect } from 'react'
import { PlaylistHeader } from './PlaylistHeader'
import { Track, TracksList } from './TracksList'

export const PlaylistPage: React.FC = () => {
  const dispatch = useAppDispatch()


  const { data, isPending } = useTracks()
  const tracks = data?.data || []


  useEffect(() => {
    if (tracks && tracks.length > 0) {
      const iTracks: ITrack[] = tracks.map((track: any) => ({ // пока оставим
        id: track.id,
        title: track.title,
        audioUrl: `${process.env.NEXT_PUBLIC_API_URL}api/v1/tracks/stream/${track.id}`,
        cover: track.cover,
        createdAt: track.createdAt,
        updatedAt: track.updatedAt || track.createdAt,
        artistId: track.artistId,
        artist: track.artistId,
        duration: track.duration || 0,
        releaseDate: track.releaseDate || null,
        lyrics: track.lyrics || null,
        name: track.title,
        file: `${process.env.NEXT_PUBLIC_API_URL}api/v1/tracks/stream/${track.id}`
      }))
      dispatch(setPlaylist(iTracks))
    }
  }, [tracks, dispatch])

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
      audioUrl: `${process.env.NEXT_PUBLIC_API_URL}api/v1/tracks/stream/${track.id}`,
      cover: track.cover,
      createdAt: track.createdAt || new Date().toISOString(),
      updatedAt: track.updatedAt || new Date().toISOString(),
      artistId: track.artistId || '',
      artist: track.artistId || 'Unknown Artist',
      duration: track.duration || 0,
      releaseDate: track.releaseDate || null,
      lyrics: track.lyrics || null,
      name: track.title,
      file: `${process.env.NEXT_PUBLIC_API_URL}api/v1/tracks/stream/${track.id}`
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
        tracksCount={tracks?.length || 0}
        duration='6 hr 30 min'
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
