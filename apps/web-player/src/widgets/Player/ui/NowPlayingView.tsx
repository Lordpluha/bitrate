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
        'fixed inset-0 z-[80] overflow-y-auto overscroll-contain transition-opacity duration-400 ease-out',
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
          var(--color-background) 85%,
          var(--color-background) 100%)`,
      }}
    >
      <div className="sticky top-0 z-20 flex min-h-14 items-center justify-between bg-linear-to-b from-black/35 to-transparent px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
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

      <section className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-5 px-4 pb-28 pt-3 sm:px-6 sm:pb-30 sm:pt-5 [@media(orientation:landscape)_and_(max-height:600px)]:grid [@media(orientation:landscape)_and_(max-height:600px)]:grid-cols-2 [@media(orientation:landscape)_and_(max-height:600px)]:gap-6 [@media(orientation:landscape)_and_(max-height:600px)]:pb-24 [@media(orientation:landscape)_and_(max-height:600px)]:pt-1 xl:pb-32">
          <Image
            alt={title}
            className="aspect-square w-full max-w-[min(30.5rem,calc(100dvh-16rem))] rounded-md object-cover shadow-2xl sm:rounded-xl [@media(orientation:landscape)_and_(max-height:600px)]:w-[min(42vw,calc(100dvh-9rem))] [@media(orientation:landscape)_and_(max-height:600px)]:justify-self-end"
            height={488}
            src={coverUrl}
            unoptimized
            width={488}
          />

          <div className="w-full max-w-122 [@media(orientation:landscape)_and_(max-height:600px)]:max-w-sm [@media(orientation:landscape)_and_(max-height:600px)]:justify-self-start">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-bold text-white sm:text-2xl">
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

      <section className="px-4 pb-24 pt-10 sm:px-6 sm:pb-26 xl:pb-28">
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

      <div className="fixed inset-x-0 bottom-0 z-30 w-full border-t border-white/10 bg-black/65 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-7xl">
          <div className="hidden items-center justify-between gap-4 xl:flex">
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

          <div className="mx-auto w-full max-w-122 xl:hidden">
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
