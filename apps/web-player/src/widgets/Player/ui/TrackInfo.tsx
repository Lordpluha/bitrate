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
  onPictureInPicture?: () => void
}

export const TrackInfo: React.FC<TrackInfoProps> = ({
  title,
  artist,
  coverUrl,
  isLiked,
  onLikeToggle,
  onPictureInPicture,
}) => {
  return (
    <div className="flex items-center gap-3 min-w-45 w-[50%]">
      <Image
        alt={title}
        className="w-14 h-14 rounded object-cover"
        height={56}
        src={coverUrl || '/images/default-playlist.jpg'}
        unoptimized
        width={56}
      />
      <div className="min-w-8">
        <div className="text-sm font-medium text-text truncate hover:underline cursor-pointer">
          {title}
        </div>
        <div className="text-xs text-text-subdued truncate hover:underline hover:text-text cursor-pointer">
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
                : 'text-text-subdued hover:text-text',
            )}
            size={16}
          />
        </button>
        <button
          aria-label="Open floating player"
          className="p-2 hover:scale-110 transition-transform"
          onClick={onPictureInPicture}
          type="button"
        >
          <PictureInPicture2
            className="text-text-subdued hover:text-text"
            size={16}
          />
        </button>
      </div>
    </div>
  )
}
