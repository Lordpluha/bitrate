import { cn } from '@spotify/ui-react'
import { Heart, PictureInPicture2 } from 'lucide-react'
import Image from 'next/image'
import type React from 'react'

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
  onLikeToggle,
}) => {
  return (
    <div className="flex items-center gap-3 min-w-45 w-[50%]">
      <Image
        alt={title}
        className="w-14 h-14 rounded object-cover"
        height={56}
        src={coverUrl || '/images/default-playlist.jpg'}
        width={56}
      />
      <div className="min-w-8">
        <div className="text-sm font-medium text-white truncate hover:underline cursor-pointer">
          {title}
        </div>
        <div className="text-xs text-gray-400 truncate hover:underline hover:text-white cursor-pointer">
          {artist}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="p-2 hover:scale-110 transition-transform"
          onClick={onLikeToggle}
          type="button"
        >
          <Heart
            className={cn(
              isLiked
                ? 'fill-green-500 text-green-500'
                : 'text-gray-400 hover:text-white',
            )}
            size={16}
          />
        </button>
        <button
          className="p-2 hover:scale-110 transition-transform"
          type="button"
        >
          <PictureInPicture2
            className="text-gray-400 hover:text-white"
            size={16}
          />
        </button>
      </div>
    </div>
  )
}
