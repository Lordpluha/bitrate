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

/** Decorative cover washes. Uses the theme's `chart-*` roles so each stays legible
 *  against the light theme's brighter ground instead of being a fixed palette hue. */
const typeGradient: Record<MusicItem['type'], string> = {
  album: 'from-chart-4 to-chart-5',
  artist: 'from-chart-2 to-chart-1',
  playlist: 'from-chart-1 to-chart-2',
  podcast: 'from-chart-2 to-chart-3',
  single: 'from-chart-3 to-chart-5',
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
