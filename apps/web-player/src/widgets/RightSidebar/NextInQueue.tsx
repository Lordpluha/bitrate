'use client'

import { play, selectCurrentTrack, selectPlaylist } from '@entities/Player'
import { useAppDispatch, useAppSelector } from '@shared/hooks'
import { useArtist } from '@shared/hooks/useArtist'
import { Button, PlayIcon, Typography } from '@spotify/ui-react'
import type React from 'react'

export const NextInQueue: React.FC = () => {
  const playlist = useAppSelector(selectPlaylist)
  const currentTrack = useAppSelector(selectCurrentTrack)
  const dispatch = useAppDispatch()

  const currentIndex =
    currentTrack && playlist.length > 0
      ? playlist.findIndex((track) => track.id === currentTrack.id)
      : -1

  const nextTrack =
    currentIndex >= 0 && currentIndex < playlist.length - 1
      ? playlist[currentIndex + 1]
      : null

  // Хук должен вызываться всегда, до условных return
  const { data: artist } = useArtist(nextTrack?.artistId)
  const artistName = artist?.username || 'Unknown Artist'

  if (!currentTrack || playlist.length === 0) {
    return null
  }

  if (!nextTrack) {
    return null
  }

  const coverUrl = nextTrack.cover?.startsWith('http')
    ? nextTrack.cover
    : `${process.env.NEXT_PUBLIC_API_URL}${nextTrack.cover}`

  return (
    <div className="bg-surface rounded-lg p-0 overflow-hidden mt-4">
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <Typography
          as="p"
          className="text-text text-sm font-semibold"
          size="body"
        >
          Next in queue
        </Typography>
        <Button
          className="text-grey-500 text-xs font-medium hover:underline p-0"
          variant="link"
        >
          Open queue
        </Button>
      </div>
      <div
        className="px-4 py-3 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-colors group"
        onClick={() => dispatch(play(nextTrack))}
      >
        <div className="relative w-12 h-12 flex-shrink-0">
          <img
            alt={nextTrack.title}
            className="w-full h-full rounded-md object-cover"
            src={coverUrl}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
            <PlayIcon className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <Typography
            as="p"
            className="text-text text-sm truncate group-hover:text-green-500 transition-colors"
            size="body"
          >
            {nextTrack.title}
          </Typography>
          <Typography
            as="p"
            className="text-grey-500 text-xs truncate"
            size="body"
          >
            {artistName}
          </Typography>
        </div>
      </div>
    </div>
  )
}
