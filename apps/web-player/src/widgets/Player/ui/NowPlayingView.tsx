'use client'

import { useImageColor, useOverlayFocus } from '@shared/hooks'
import { cn } from '@spotify/ui-react'
import { ChevronDown, Minimize2 } from 'lucide-react'
import { NowPlayingDetails } from './NowPlayingDetails'
import { NowPlayingFooter } from './NowPlayingFooter'
import { NowPlayingHero } from './NowPlayingHero'
import type { NowPlayingViewProps } from './nowPlaying.types'

export const NowPlayingView = ({
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
}: NowPlayingViewProps) => {
  const [r, g, b] = useImageColor(coverUrl)
  const dialogRef = useOverlayFocus<HTMLDivElement>({ isOpen, onClose })

  return (
    <div
      aria-label={`Now playing ${title}`}
      aria-modal="true"
      className={cn(
        'fixed inset-0 z-[80] overflow-y-auto overscroll-contain transition-opacity duration-400 ease-out',
        isOpen
          ? 'opacity-100 visible'
          : 'opacity-0 invisible pointer-events-none',
      )}
      ref={dialogRef}
      role="dialog"
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

      <NowPlayingHero
        artist={artist}
        coverUrl={coverUrl}
        isLiked={isLiked}
        onLikeToggle={onLikeToggle}
        title={title}
      />
      <NowPlayingDetails />
      <NowPlayingFooter
        artist={artist}
        coverUrl={coverUrl}
        currentTime={currentTime}
        duration={duration}
        isLiked={isLiked}
        isPlaying={isPlaying}
        onLikeToggle={onLikeToggle}
        onNext={onNext}
        onPlayPause={onPlayPause}
        onPrevious={onPrevious}
        onSeek={onSeek}
        onVolumeChange={onVolumeChange}
        title={title}
        volume={volume}
      />
    </div>
  )
}
