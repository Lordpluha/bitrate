'use client'

import { useImageColor } from '@shared/hooks/useImageColor'
import { cn } from '@spotify/ui-react'
import { AboutArtist } from '@widgets/RightSidebar/AboutArtist'
import { Credits } from '@widgets/RightSidebar/Credits'
import { NextInQueue } from '@widgets/RightSidebar/NextInQueue'
import { CheckCircle2, ChevronDown, Heart, Minimize2 } from 'lucide-react'
import Image from 'next/image'
import { useEffect } from 'react'
import { PlayerActions } from './PlayerActions'
import { PlayerControls } from './PlayerControls'
import { TrackInfo } from './TrackInfo'

interface NowPlayingViewProps {
  isOpen: boolean
  onClose: () => void
  title: string
  artist: string
  coverUrl: string
  isLiked?: boolean
  isPlaying: boolean
  currentTime: number
  duration: number
  onPlayPause: () => void
  onSeek: (time: number) => void
  onNext: () => void
  onPrevious: () => void
  onLikeToggle?: () => void
  volume: number
  onVolumeChange: (volume: number) => void
  playlistTitle?: string
}

export const NowPlayingView: React.FC<NowPlayingViewProps> = ({
  isOpen,
  onClose,
  title,
  artist,
  coverUrl,
  isLiked = false,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  onNext,
  onPrevious,
  onLikeToggle,
  volume,
  onVolumeChange,
  playlistTitle = 'Playlist',
}) => {
  const [r, g, b] = useImageColor(coverUrl)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <div
      className={cn(
        'fixed inset-0 z-60 overflow-y-auto transition-opacity duration-400 ease-out',
        isOpen
          ? 'opacity-100 visible'
          : 'opacity-0 invisible pointer-events-none',
      )}
      style={{
        background: `linear-gradient(180deg,
          rgb(${Math.min(r * 1.8, 255)}, ${Math.min(g * 1.8, 255)}, ${Math.min(b * 1.8, 255)}) 0%,
          rgb(${Math.min(r * 1.4, 220)}, ${Math.min(g * 1.4, 220)}, ${Math.min(b * 1.4, 220)}) 20%,
          rgb(${r}, ${g}, ${b}) 45%,
          rgb(${Math.round(r * 0.5)}, ${Math.round(g * 0.5)}, ${Math.round(b * 0.5)}) 65%,
          #0f0f0f 85%,
          #0a0a0a 100%)`,
      }}
    >
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 pt-4 pb-2 bg-linear-to-b from-black/35 to-transparent">
        <p className="text-white/90 text-sm font-semibold truncate">
          {playlistTitle}
        </p>

        <div className="flex items-center gap-1">
          <button
            aria-label="Minimize now playing"
            className="p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10"
            onClick={onClose}
            type="button"
          >
            <ChevronDown size={22} />
          </button>
          <button
            aria-label="Return to normal view"
            className="p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10"
            onClick={onClose}
            type="button"
          >
            <Minimize2 size={18} />
          </button>
        </div>
      </div>

      <section className="min-h-[calc(100dvh-82px)] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-8 pb-28 max-[1024px]:pb-24 sm:max-[1024px]:pb-26">
          <Image
            alt={title}
            className="w-full max-w-122 aspect-square rounded-xl shadow-2xl object-cover"
            height={488}
            src={coverUrl}
            unoptimized
            width={488}
          />

          <div className="w-full max-w-122 mt-6">
            <div className="flex items-center justify-between mb-5">
              <div className="min-w-0 flex-1">
                <h2 className="text-white text-2xl font-bold truncate">
                  {title}
                </h2>
                <p className="text-white/60 mt-1 text-sm">{artist}</p>
              </div>
              <button
                aria-label={isLiked ? 'Saved to library' : 'Like'}
                className="ml-4 p-2 text-white/50 hover:text-white transition-colors shrink-0"
                onClick={onLikeToggle}
                type="button"
              >
                {isLiked ? (
                  <CheckCircle2
                    className="text-green-500 fill-green-500"
                    size={22}
                  />
                ) : (
                  <Heart size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-28 max-[1024px]:pb-24 sm:max-[1024px]:pb-26 pt-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <AboutArtist />
              <NextInQueue />
            </div>
            <div className="flex flex-col gap-4">
              <Credits />
            </div>
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-30 w-full border-t border-white/10 bg-black/65 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex max-[1024px]:hidden items-center justify-between gap-4">
            <div className="w-[28%] min-w-0">
              <TrackInfo
                artist={artist}
                coverUrl={coverUrl}
                isLiked={isLiked}
                onLikeToggle={onLikeToggle}
                title={title}
              />
            </div>

            <div className="w-[44%] flex justify-center">
              <PlayerControls
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
                onNext={onNext}
                onPlayPause={onPlayPause}
                onPrevious={onPrevious}
                onSeek={onSeek}
              />
            </div>

            <div className="w-[28%] flex justify-end">
              <PlayerActions onVolumeChange={onVolumeChange} volume={volume} />
            </div>
          </div>

          <div className="hidden max-[1024px]:block mx-auto w-full max-w-122">
            <PlayerControls
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              onNext={onNext}
              onPlayPause={onPlayPause}
              onPrevious={onPrevious}
              onSeek={onSeek}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
