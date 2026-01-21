import React from 'react'
import { Heart, PictureInPicture2 } from 'lucide-react'
import { cn } from '@spotify/ui-react'

interface TrackInfoProps {
  title: string
  artist: string
  coverUrl?: string
  isLiked: boolean
  onLikeToggle?: () => void
}

export const TrackInfo: React.FC<TrackInfoProps> = ({
  title,
  artist,
  coverUrl,
  isLiked,
  onLikeToggle
}) => {
  return (
    <div className="flex items-center gap-3 min-w-[180px] w-[50%]">
      <img
        src={coverUrl || '/images/drive-cover-big.jpg'}
        alt={title}
        className="w-14 h-14 rounded object-cover"
      />
      <div className="min-w-8">
        <div className="text-sm font-medium text-white truncate hover:underline cursor-pointer">
          {title}
        </div>
        <div className="text-xs text-gray-400 truncate hover:underline hover:text-white cursor-pointer">{artist}</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onLikeToggle}
          className="p-2 hover:scale-110 transition-transform"
        >
          <Heart
            size={16}
            className={cn(
              isLiked ? 'fill-green-500 text-green-500' : 'text-gray-400 hover:text-white'
            )}
          />
        </button>
        <button
          className="p-2 hover:scale-110 transition-transform"
        >
          <PictureInPicture2
            size={16}
            className="text-gray-400 hover:text-white"
          />
        </button>
      </div>
    </div>
  )
}
