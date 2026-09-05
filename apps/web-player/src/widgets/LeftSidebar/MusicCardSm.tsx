'use client'
import { cn } from '@bitrate/ui-react'
import { Volume2 } from 'lucide-react'
import Link from 'next/link'
import type { MouseEvent } from 'react'
import { LibraryItemCover } from './LibraryItemCover'
import { resolveLibraryHref } from './lib/resolveLibraryHref'

export interface MusicItem {
  id: string
  title: string
  username: string
  type: 'artist' | 'playlist' | 'album' | 'single' | 'podcast'
  cover: string
  tracksCount?: number
}

interface MusicCardSmProps {
  isActive?: boolean
  isCollapsed?: boolean
  isPlaying?: boolean
  item: MusicItem
}

let lastSidebarNavigationAt = 0
const sidebarNavigationCooldownMs = 450

export const MusicCardSm = ({
  isActive = false,
  isCollapsed = false,
  isPlaying = false,
  item,
}: MusicCardSmProps) => {
  const href = resolveLibraryHref(item)
  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
    const now = Date.now()

    if (
      isActive ||
      now - lastSidebarNavigationAt < sidebarNavigationCooldownMs
    ) {
      event.preventDefault()
      return
    }

    lastSidebarNavigationAt = now
  }

  if (isCollapsed) {
    return (
      <Link
        aria-label={item.title}
        className={cn(
          'group flex h-16 w-16 items-center justify-center rounded-md transition-colors hover:bg-surface',
          isActive && 'bg-surface',
        )}
        href={href}
        onClick={handleNavigate}
        prefetch={false}
        title={item.title}
      >
        <LibraryItemCover collapsed isPlaying={isPlaying} item={item} />
      </Link>
    )
  }

  return (
    <Link
      className={cn(
        'group flex items-center gap-3 p-2 rounded-md hover:bg-surface cursor-pointer transition-all duration-150',
        isActive && 'bg-surface',
      )}
      href={href}
      onClick={handleNavigate}
      prefetch={false}
    >
      <LibraryItemCover isPlaying={isPlaying} item={item} />

      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            'font-semibold text-sm truncate group-hover:text-text transition-colors duration-150 leading-tight',
            isPlaying ? 'text-primary' : 'text-text',
          )}
        >
          {item.title}
        </h3>
        <p className="text-text-subdued text-xs truncate group-hover:text-text-secondary transition-colors duration-150 mt-0.5">
          {item.type.slice(0, 1).toUpperCase() + item.type.slice(1)} •{' '}
          {item.username}
          {item.tracksCount && ` • ${item.tracksCount} songs`}
        </p>
      </div>
      {isPlaying && (
        <Volume2
          aria-label={`${item.title} is playing`}
          className="shrink-0 text-primary"
          size={16}
        />
      )}
    </Link>
  )
}
