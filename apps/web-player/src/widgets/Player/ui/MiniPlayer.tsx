'use client'

import { useImageColor } from '@shared/hooks/useImageColor'
import { MiniPlayerControls } from './MiniPlayerControls'
import { MiniPlayerTrackInfo } from './MiniPlayerTrackInfo'

interface MiniPlayerProps {
  title: string
  artist: string
  coverUrl: string
  isPlaying: boolean
  isVisible: boolean
  isLiked?: boolean
  currentTime: number
  duration: number
  onPlayPause: () => void
  onExpand: () => void
  onPrevious: () => void
  onNext: () => void
  onLikeToggle?: () => void
}

export const MiniPlayer = ({
  title,
  artist,
  coverUrl,
  isPlaying,
  isVisible,
  isLiked = false,
  currentTime,
  duration,
  onPlayPause,
  onExpand,
  onPrevious,
  onNext,
  onLikeToggle,
}: MiniPlayerProps) => {
  const progress =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0

  const [r, g, b] = useImageColor(coverUrl)

  return (
    <div
      className={`fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-[max(0.5rem,env(safe-area-inset-left))] right-[max(0.5rem,env(safe-area-inset-right))] z-50 hidden w-auto max-w-none max-xl:block transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div
        className="relative overflow-hidden rounded-md border border-white/10 shadow-2xl"
        style={{
          background: `linear-gradient(105deg,
            rgb(${Math.min(r * 1.35, 210)}, ${Math.min(g * 1.35, 210)}, ${Math.min(b * 1.35, 210)}) 0%,
            rgb(${r}, ${g}, ${b}) 50%,
            rgb(${Math.round(r * 0.45)}, ${Math.round(g * 0.45)}, ${Math.round(b * 0.45)}) 100%)`,
        }}
      >
        <div className="h-0.5 w-full bg-white/10">
          <div
            className="h-full bg-white/65"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-3 px-2 py-2 min-[520px]:px-3 min-[520px]:py-2.5">
          <MiniPlayerTrackInfo
            artist={artist}
            coverUrl={coverUrl}
            onExpand={onExpand}
            title={title}
          />
          <MiniPlayerControls
            isLiked={isLiked}
            isPlaying={isPlaying}
            onLikeToggle={onLikeToggle}
            onNext={onNext}
            onPlayPause={onPlayPause}
            onPrevious={onPrevious}
          />
        </div>
      </div>
    </div>
  )
}
