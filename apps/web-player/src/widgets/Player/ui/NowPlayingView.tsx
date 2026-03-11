'use client'

import { cn } from '@spotify/ui-react'
import { useImageColor } from '@shared/hooks/useImageColor'
import { AboutArtist } from '@widgets/RightSidebar/AboutArtist'
import { Credits } from '@widgets/RightSidebar/Credits'
import { NextInQueue } from '@widgets/RightSidebar/NextInQueue'
import { Heart, ChevronDown, Minimize2 } from 'lucide-react'
import { useEffect } from 'react'
import { PlayerControls } from './PlayerControls'

interface NowPlayingViewProps {
  isOpen: boolean
  onClose: () => void
  title: string
  artist: string
  coverUrl: string
  isPlaying: boolean
  currentTime: number
  duration: number
  onPlayPause: () => void
  onSeek: (time: number) => void
  onNext: () => void
  onPrevious: () => void
}

export const NowPlayingView: React.FC<NowPlayingViewProps> = ({
  isOpen,
  onClose,
  title,
  artist,
  coverUrl,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  onNext,
  onPrevious,
}) => {
  // Предзагружаем цвет всегда, а не только когда открыто — чтобы градиент
  // был готов в момент открытия, а не появлялся с задержкой
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
        'fixed inset-0 z-60 overflow-y-auto transition-transform duration-500 ease-in-out',
        isOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none',
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
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={onClose}
          className="p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10"
          aria-label="Minimize now playing"
          type="button"
        >
          <ChevronDown size={24} />
        </button>

        <div className="min-w-0 flex-1 text-center px-4">
          <p className="text-white/50 text-xs uppercase tracking-widest truncate">Now Playing</p>
          <p className="text-white text-sm font-semibold truncate">{title}</p>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10"
          aria-label="Return to normal view"
          type="button"
        >
          <Minimize2 size={18} />
        </button>
      </div>

      <div className="flex flex-col items-center px-6 pt-4 pb-20">
        <img
          src={coverUrl}
          alt={title}
          className="w-full max-w-sm aspect-square rounded-xl shadow-2xl object-cover"
        />

        <div className="w-full max-w-xl mt-6">
          <div className="flex items-center justify-between mb-5">
            <div className="min-w-0 flex-1">
              <h2 className="text-white text-2xl font-bold truncate">{title}</h2>
              <p className="text-white/60 mt-1 text-sm">{artist}</p>
            </div>
            <button
              className="ml-4 p-2 text-white/50 hover:text-white transition-colors shrink-0"
              type="button"
              aria-label="Like"
            >
              <Heart size={20} />
            </button>
          </div>

          <PlayerControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={onPlayPause}
            onSeek={onSeek}
            onNext={onNext}
            onPrevious={onPrevious}
          />
        </div>

        <div className="w-full max-w-5xl mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AboutArtist />
            <div className="flex flex-col gap-4">
              <Credits />
              <NextInQueue />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
