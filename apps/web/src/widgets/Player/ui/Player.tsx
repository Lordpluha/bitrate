'use client'

import { useState, useEffect } from 'react'
import { TrackInfo } from './TrackInfo'
import { PlayerControls } from './PlayerControls'
import { PlayerActions } from './PlayerActions'
import { RootState } from '@shared/store'
import { useAudioPlayer, useAppSelector, useAppDispatch } from '@shared/hooks'
import { setVolume } from '@entities/Player/store/PlayerSlice'

export const Player: React.FC = () => {
  const { currentTrack, isPlaying, volume, currentTime, duration } = useAppSelector((state) => state.musicPlayer)
  const dispatch = useAppDispatch()
  const [isVisible, setIsVisible] = useState(false)
  const { 
    audioRef, 
    togglePlayPause, 
    onSeek, 
    changeTrack,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleEnded,
    handleVolumeChange,
    handleSeeked
  } = useAudioPlayer()

  useEffect(() => {
    if (currentTrack) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [currentTrack])

  useEffect(() => {
    handleVolumeChange()
  }, [volume])

  if (!currentTrack) {
    return null
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl || currentTrack.file}
        autoPlay={isPlaying}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onSeeked={handleSeeked}
      />
      
      <div 
        className={`fixed bottom-0 left-0 right-0 h-[90px] bg-black border-t border-gray-800 px-4 flex items-center justify-between gap-4 z-50 transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-[25%]">
          <TrackInfo
            title={currentTrack.title || currentTrack.name || 'Unknown'}
            artist={currentTrack.artist || 'Unknown Artist'}
            coverUrl={currentTrack.cover}
            isLiked={false}
          />
        </div>

        <div className="w-[40%] flex justify-center">
          <PlayerControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={togglePlayPause}
            onSeek={onSeek}
            onNext={() => changeTrack('next')}
            onPrevious={() => changeTrack('prev')}
          />
        </div>

        <div className="w-[35%] flex justify-end">
          <PlayerActions 
            volume={volume}
            onVolumeChange={(vol) => dispatch(setVolume(vol))}
          />
        </div>
      </div>
    </>
  )
}
