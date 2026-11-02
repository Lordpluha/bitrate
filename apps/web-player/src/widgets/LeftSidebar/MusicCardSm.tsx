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
  type: 'artist' | 'playlist' | 'album' | 'single'
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
        'group flex h-13 items-center gap-3 rounded-md px-1.5 hover:bg-surface cursor-pointer transition-all duration-150',
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
            'truncate font-[family-name:var(--font-landing-body)] text-sm leading-tight font-semibold transition-colors duration-150 group-hover:text-foreground',
            isPlaying ? 'text-primary' : 'text-foreground',
          )}
        >
          {item.title}
        </h3>
        <p className="mt-0.75 truncate text-xs text-muted-foreground transition-colors duration-150 group-hover:text-text-secondary">
          {item.type.slice(0, 1).toUpperCase() + item.type.slice(1)} •{' '}
          {item.username}
          {item.tracksCount ? ` • ${item.tracksCount} songs` : null}
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
