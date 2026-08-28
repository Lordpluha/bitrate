'use client'

import { ROUTES } from '@shared/routes'
import { ListMusic, Maximize2, Mic2, Volume2, VolumeX } from 'lucide-react'
import Link from 'next/link'
import type { ChangeEvent } from 'react'

const iconButtonClassName =
  'p-2 text-text-subdued hover:text-text hover:scale-110 transition-all'

interface PlayerActionsProps {
  volume: number
  onVolumeChange: (volume: number) => void
  onExpand?: () => void
}

export const PlayerActions = ({
  volume,
  onVolumeChange,
  onExpand,
}: PlayerActionsProps) => {
  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(Number(e.target.value))
  }

  const toggleMute = () => {
    onVolumeChange(volume > 0 ? 0 : 0.5)
  }

  return (
    <div className="flex items-center gap-2 min-w-45 justify-end">
      <Link
        aria-label="Open lyrics"
        className={iconButtonClassName}
        href={ROUTES.lyrics}
      >
        <Mic2 size={16} />
      </Link>
      <Link
        aria-label="Open queue"
        className={iconButtonClassName}
        href={ROUTES.queue}
      >
        <ListMusic size={16} />
      </Link>
      <button
        aria-label={volume === 0 ? 'Unmute' : 'Mute'}
        className={iconButtonClassName}
        onClick={toggleMute}
        type="button"
      >
        {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
      <div className="w-24 relative h-1 bg-surface rounded-full group">
        <div
          className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all"
          style={{
            width: `${volume * 100}%`,
          }}
        />
        <input
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          max="1"
          min="0"
          onChange={handleVolumeChange}
          step="0.01"
          type="range"
          value={volume}
        />
      </div>
      <button
        aria-label="Open full player"
        className="p-2 text-text-subdued hover:text-text hover:scale-110 transition-all"
        onClick={onExpand}
        type="button"
      >
        <Maximize2 size={16} />
      </button>
    </div>
  )
}
