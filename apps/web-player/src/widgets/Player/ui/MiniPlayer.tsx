'use client'

import { CirclePlus, MonitorSpeaker, Pause, Play } from 'lucide-react'
import { useImageColor } from '@shared/hooks/useImageColor'

interface MiniPlayerProps {
  title: string
  artist: string
  coverUrl: string
  isPlaying: boolean
  isVisible: boolean
  onPlayPause: () => void
  onExpand: () => void
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  title,
  artist,
  coverUrl,
  isPlaying,
  isVisible,
  onPlayPause,
  onExpand,
}) => {
  const safeSrc = '/images/drive-cover-big.jpg'

  const [r, g, b] = useImageColor(safeSrc)

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 xl:hidden transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* thin progress bar at top */}
      <div className="h-0.5 w-full bg-white/10">
        <div className="h-full w-1/3 bg-white/40" />
      </div>

      <div
        className="flex items-center gap-3 px-4 py-3 border-t border-white/10"
        style={{
          background: `linear-gradient(105deg,
            rgb(${Math.min(r * 1.4, 200)}, ${Math.min(g * 1.4, 200)}, ${Math.min(b * 1.4, 200)}) 0%,
            rgb(${r}, ${g}, ${b}) 50%,
            rgb(${Math.round(r * 0.6)}, ${Math.round(g * 0.6)}, ${Math.round(b * 0.6)}) 100%)`,
        }}
      >
        {/* cover — tapping opens NowPlayingView */}
        <button
          type="button"
          onClick={onExpand}
          className="shrink-0"
          aria-label="Open now playing"
        >
          {/* biome-ignore lint/performance/noImgElement: mini player cover */}
          <img
            src={safeSrc}
            alt={title}
            className="w-12 h-12 rounded object-cover"
          />
        </button>

        {/* track info — tapping also opens */}
        <button
          type="button"
          onClick={onExpand}
          className="flex-1 min-w-0 text-left"
          aria-label="Open now playing"
        >
          <p className="text-text text-sm font-semibold truncate leading-tight">{title}</p>
          <p className="text-text-subdued text-xs truncate mt-0.5">{artist}</p>
        </button>

        {/* actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            className="p-2 text-text-subdued hover:text-text transition-colors"
            aria-label="Connect to a device"
          >
            <MonitorSpeaker size={22} />
          </button>
          <button
            type="button"
            className="p-2 text-text-subdued hover:text-text transition-colors"
            aria-label="Add to library"
          >
            <CirclePlus size={22} />
          </button>
          <button
            type="button"
            onClick={onPlayPause}
            className="p-2 text-text hover:scale-110 transition-transform"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying
              ? <Pause size={26} fill="currentColor" strokeWidth={0} />
              : <Play size={26} fill="currentColor" strokeWidth={0} />}
          </button>
        </div>
      </div>
    </div>
  )
}
