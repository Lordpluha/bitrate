'use client'

import { Skeleton } from '@shared/ui'
import { MediaImage } from '@shared/ui/MediaImage'
import Link from 'next/link'
import { LIKED_SONGS_ID, usePlaylistLibraryItems } from '@/entities/Playlist'
import { ROUTES } from '@/shared/routes'

const loadingCardIds = [
  'library-card-1',
  'library-card-2',
  'library-card-3',
  'library-card-4',
]

export const LibraryQuickGrid = () => {
  const { isLoading, items } = usePlaylistLibraryItems()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
        {loadingCardIds.map((id) => (
          <Skeleton className="h-14 rounded-lg" key={id} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => {
        const href =
          item.id === LIKED_SONGS_ID
            ? ROUTES.likedSongs
            : ROUTES.playlist(item.id)

        return (
          <Link
            className="group flex h-14 min-w-0 items-center gap-3 overflow-hidden rounded-lg bg-card transition-colors hover:bg-secondary"
            href={href}
            key={item.id}
          >
            <MediaImage
              alt={item.title}
              className="size-14 shrink-0 object-cover"
              fallback="playlist"
              height={56}
              src={item.cover}
              unoptimized
              width={56}
            />
            <span className="line-clamp-2 min-w-0 pr-3 text-[13px] font-semibold text-foreground">
              {item.title}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
