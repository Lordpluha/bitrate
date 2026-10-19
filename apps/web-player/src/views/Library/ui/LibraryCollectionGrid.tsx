'use client'

import { cn } from '@bitrate/ui-react'
import { MusicCardLg } from '@shared/ui'
import { MediaImage } from '@shared/ui/MediaImage'
import Link from 'next/link'
import { usePlayCollection } from '@/features/PlayCollection'
import type { LibraryViewMode } from '@/views/Library/model/library.types'
import { LibraryEmptyState } from '@/views/Library/ui/LibraryEmptyAware'

/** One saved album or playlist as the grid and the phone list show it. */
type LibraryCollectionItem = {
  cover: string
  href: string
  id: string
  /** What its play button starts; Liked Songs opens its page instead. */
  playKind?: 'album' | 'playlist'
  subtitle: string
  title: string
}

type LibraryCollectionGridProps = {
  items: LibraryCollectionItem[]
  viewMode: LibraryViewMode
}

/**
 * The design's library grid: Card/Album in five columns on wide screens. Phones follow the
 * list/grid switch — 64px rows with a 48px cover, or two columns of cards.
 */
export const LibraryCollectionGrid = ({
  items,
  viewMode,
}: LibraryCollectionGridProps) => {
  const playCollection = usePlayCollection()

  if (items.length === 0) return <LibraryEmptyState />

  const isList = viewMode === 'list'

  return (
    <ul
      className={cn(
        'grid xl:grid-cols-5 xl:gap-5.5',
        isList
          ? 'grid-cols-1'
          : 'grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4',
      )}
    >
      {items.map((item) => {
        const onPlay = item.playKind
          ? () =>
              void playCollection({
                id: item.id,
                kind: item.playKind ?? 'playlist',
                title: item.title,
              })
          : undefined

        return (
          <li key={item.id}>
            {isList ? (
              <Link
                className="flex h-16 min-w-0 items-center gap-3 rounded-lg px-1 transition-colors hover:bg-surface xl:hidden"
                href={item.href}
              >
                <MediaImage
                  alt=""
                  className="size-12 shrink-0 rounded-md object-cover"
                  fallback="playlist"
                  height={48}
                  src={item.cover}
                  unoptimized
                  width={48}
                />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {item.title}
                  </span>
                  <span className="truncate text-[13px] text-muted-foreground">
                    {item.subtitle}
                  </span>
                </span>
              </Link>
            ) : null}
            <div className={cn(isList && 'hidden xl:block')}>
              <MusicCardLg
                description={item.subtitle}
                href={item.href}
                id={item.id}
                imageUrl={item.cover}
                name={item.title}
                onPlay={onPlay}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
