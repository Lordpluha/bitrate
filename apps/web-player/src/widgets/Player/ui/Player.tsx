'use client'

import {
  selectMusicPlayer,
  setVolume,
} from '@entities/Player/store/PlayerSlice'
import { useAppDispatch, useAppSelector, useAudioPlayer } from '@shared/hooks'
import { useArtist } from '@shared/hooks/useArtist'
import { useEffect, useState } from 'react'
import { PlayerActions } from './PlayerActions'
import { PlayerControls } from './PlayerControls'
import { TrackInfo } from './TrackInfo'

export const Player: React.FC = () => {
  const { currentTrack, isPlaying, volume, currentTime, duration } =
    useAppSelector(selectMusicPlayer)
  const dispatch = useAppDispatch()
  const [isVisible, setIsVisible] = useState(false)
  const { data: artist } = useArtist(currentTrack?.artistId)
  const artistName = artist?.username || 'Unknown Artist'

  const {
    activeSlot,
    bindAudioElement,
    togglePlayPause,
    onSeek,
    changeTrack,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleEnded,
    handleSeeked,
  } = useAudioPlayer()

  useEffect(() => {
    if (currentTrack) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [currentTrack])

  if (!currentTrack) {
    return null
  }

  return (
    <>
      {([0, 1] as const).map((slot) => (
        // biome-ignore lint/a11y/useMediaCaption: audio-only playback has no caption track
        <audio
          data-active={activeSlot === slot}
          key={slot}
          onEnded={() => handleEnded(slot)}
          onLoadedMetadata={() => handleLoadedMetadata(slot)}
          onSeeked={handleSeeked}
          onTimeUpdate={() => handleTimeUpdate(slot)}
          preload="auto"
          ref={(element) => bindAudioElement(slot, element)}
        />
      ))}

      <div
        className={`fixed bottom-0 left-0 right-0 h-22.5 bg-black border-t border-gray-800 px-4 flex items-center justify-between gap-4 z-50 transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-[25%]">
          <TrackInfo
            artist={artistName}
            coverUrl={currentTrack.cover}
            isLiked={false}
            title={currentTrack.title || 'Unknown'}
          />
        </div>

        <div className="w-[40%] flex justify-center">
          <PlayerControls
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            onNext={() => changeTrack('next')}
            onPlayPause={togglePlayPause}
            onPrevious={() => changeTrack('prev')}
            onSeek={onSeek}
          />
        </div>

        <div className="w-[35%] flex justify-end">
          <PlayerActions
            onVolumeChange={(vol) => dispatch(setVolume(vol))}
            volume={volume}
          />
        </div>
      </div>
    </>
  )
}
