import React from 'react'
import { Volume2, VolumeX, ListMusic, Mic2, MonitorSpeaker, Maximize2 } from 'lucide-react'

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
    <div className="flex items-center gap-2 min-w-[180px] justify-end">
      <button className="p-2 text-gray-400 hover:text-white hover:scale-110 transition-all">
        <Mic2 size={16} />
      </button>
      <button className="p-2 text-gray-400 hover:text-white hover:scale-110 transition-all">
        <ListMusic size={16} />
      </button>
      <button className="p-2 text-gray-400 hover:text-white hover:scale-110 transition-all">
        <MonitorSpeaker size={16} />
      </button>
      <button
        onClick={toggleMute}
        className="p-2 text-gray-400 hover:text-white hover:scale-110 transition-all"
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
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <button className="p-2 text-gray-400 hover:text-white hover:scale-110 transition-all">
        <Maximize2 size={16} />
      </button>
    </div>
  )
}
