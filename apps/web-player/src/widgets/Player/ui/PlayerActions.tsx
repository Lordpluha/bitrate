'use client'

import {
  ListMusic,
  Maximize2,
  Mic2,
  MonitorSpeaker,
  Volume2,
  VolumeX,
} from 'lucide-react'
import type React from 'react'

interface PlayerActionsProps {
  volume: number
  onVolumeChange: (volume: number) => void
}

export const PlayerActions: React.FC<PlayerActionsProps> = ({
  volume,
  onVolumeChange,
}) => {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(Number(e.target.value))
  }

  const toggleMute = () => {
    onVolumeChange(volume > 0 ? 0 : 0.5)
  }

  return (
    <div className="flex items-center gap-2 min-w-45 justify-end">
      <button
        className="p-2 text-gray-400 hover:text-white hover:scale-110 transition-all"
        type="button"
      >
        <Mic2 size={16} />
      </button>
      <button
        className="p-2 text-gray-400 hover:text-white hover:scale-110 transition-all"
        type="button"
      >
        <ListMusic size={16} />
      </button>
      <button
        className="p-2 text-gray-400 hover:text-white hover:scale-110 transition-all"
        type="button"
      >
        <MonitorSpeaker size={16} />
      </button>
      <button
        className="p-2 text-gray-400 hover:text-white hover:scale-110 transition-all"
        onClick={toggleMute}
        type="button"
      >
        {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
      <div className="w-24 relative h-1 bg-gray-600 rounded-full group">
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
        className="p-2 text-gray-400 hover:text-white hover:scale-110 transition-all"
        type="button"
      >
        <Maximize2 size={16} />
      </button>
    </div>
  )
}
