import { cn } from '@spotify/ui-react'
import { Volume2 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import type { MusicItem } from './MusicCardSm'

type LibraryItemCoverProps = {
  collapsed?: boolean
  isPlaying: boolean
  item: MusicItem
}

const typeGradient: Record<MusicItem['type'], string> = {
  album: 'from-orange-500 to-red-500',
  artist: 'from-sky-500 to-cyan-500',
  playlist: 'from-green-500 to-blue-500',
  podcast: 'from-blue-600 to-indigo-600',
  single: 'from-purple-500 to-pink-500',
}

export const LibraryItemCover = ({
  collapsed = false,
  isPlaying,
  item,
}: LibraryItemCoverProps) => {
  const [imageError, setImageError] = useState(false)
  const size = collapsed ? 56 : 48

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-md shadow-md transition-shadow duration-150 group-hover:shadow-lg',
        collapsed ? 'size-14' : 'size-12',
      )}
    >
      {!imageError ? (
        <Image
          alt=""
          className="object-cover"
          fill
          onError={() => setImageError(true)}
          sizes={`${size}px`}
          src={item.cover}
          unoptimized
        />
      ) : (
        <div
          className={cn(
            'flex size-full items-center justify-center bg-linear-to-br',
            typeGradient[item.type],
          )}
        >
          <span className="text-xs font-bold text-white drop-shadow-sm">
            {item.title.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      {collapsed && isPlaying && (
        <span className="absolute bottom-1 right-1 flex size-5 items-center justify-center rounded-full bg-background/80 text-green-500">
          <Volume2 aria-hidden="true" size={12} />
        </span>
      )}
    </div>
  )
}
