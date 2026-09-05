'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePlaylistLibraryItems } from '@/entities/Playlist'
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
      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-4">
        {loadingCardIds.map((id) => (
          <div className="h-16 animate-pulse rounded-md bg-surface" key={id} />
        ))}
      </div>
    )
  }

  return (
    <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => {
        const href =
          item.id === 'liked-songs'
            ? ROUTES.likedSongs
            : ROUTES.playlist(item.id)

        return (
          <Link
            className="group flex min-h-16 min-w-0 overflow-hidden rounded-md bg-surface transition-colors hover:bg-surface-hover"
            href={href}
            key={item.id}
          >
            <Image
              alt={item.title}
              className="size-16 shrink-0 object-cover"
              height={64}
              src={item.cover}
              unoptimized
              width={64}
            />
            <span className="flex min-w-0 items-center px-3 py-2">
              <span className="line-clamp-2 text-sm font-bold leading-5 text-text sm:text-base">
                {item.title}
              </span>
            </span>
          </Link>
        )
      })}
    </div>
  )
}
