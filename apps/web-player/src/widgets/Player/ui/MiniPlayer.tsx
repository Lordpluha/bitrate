'use client'

import { useImageColor } from '@shared/hooks/useImageColor'
import {
  CheckCircle2,
  CirclePlus,
  MonitorSpeaker,
  Pause,
  Play,
  SkipForward,
} from 'lucide-react'
import Image from 'next/image'

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
  onNext: () => void
  onLikeToggle?: () => void
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
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
  onNext,
  onLikeToggle,
}) => {
  const progress =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0

  const [r, g, b] = useImageColor(coverUrl)

  return (
    <div
      className={`fixed bottom-16 left-2 right-2 z-50 hidden max-[1024px]:block transition-transform duration-300 ease-in-out ${
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

        <div className="flex items-center gap-3 px-3 py-2.5 min-[520px]:px-4 min-[520px]:py-3">
          <button
            aria-label="Open now playing"
            className="shrink-0"
            onClick={onExpand}
            type="button"
          >
            <Image
              alt={title}
              className="w-11 h-11 min-[520px]:w-12 min-[520px]:h-12 rounded object-cover"
              height={48}
              src={coverUrl}
              unoptimized
              width={48}
            />
          </button>

          <button
            aria-label="Open now playing"
            className="flex-1 min-w-0 text-left"
            onClick={onExpand}
            type="button"
          >
            <p className="text-white text-sm font-semibold truncate leading-tight">
              {title}
            </p>
            <p className="text-white/65 text-xs truncate mt-0.5">{artist}</p>
          </button>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              aria-label={isLiked ? 'Saved to library' : 'Add to library'}
              className="hidden min-[520px]:block p-2 text-white/70 hover:text-white transition-colors"
              onClick={onLikeToggle}
              type="button"
            >
              {isLiked ? (
                <CheckCircle2
                  className="text-green-500 fill-green-500"
                  size={22}
                />
              ) : (
                <CirclePlus size={22} />
              )}
            </button>
            <button
              aria-label="Connect to a device"
              className="hidden min-[620px]:block p-2 text-white/70 hover:text-white transition-colors"
              type="button"
            >
              <MonitorSpeaker size={22} />
            </button>
            <button
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="p-2 text-white hover:scale-110 transition-transform"
              onClick={onPlayPause}
              type="button"
            >
              {isPlaying ? (
                <Pause fill="currentColor" size={26} strokeWidth={0} />
              ) : (
                <Play fill="currentColor" size={26} strokeWidth={0} />
              )}
            </button>
            <button
              aria-label="Next track"
              className="p-2 text-white/85 hover:text-white transition-colors"
              onClick={onNext}
              type="button"
            >
              <SkipForward fill="currentColor" size={22} strokeWidth={0} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
