'use client'
import { ROUTES } from '@shared/routes'
import { cn } from '@spotify/ui-react'
import { Volume2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { type MouseEvent, useState } from 'react'

interface MusicItem {
  id: string
  title: string
  username: string
  type: 'playlist' | 'album' | 'single' | 'podcast'
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

const getTypeColor = (type: MusicItem['type']) => {
  switch (type) {
    case 'playlist':
      return 'from-green-500 to-blue-500'
    case 'album':
      return 'from-orange-500 to-red-500'
    case 'single':
      return 'from-purple-500 to-pink-500'
    case 'podcast':
      return 'from-blue-600 to-indigo-600'
    default:
      return 'from-gray-500 to-gray-700'
  }
}

export const MusicCardSm = ({
  isActive = false,
  isCollapsed = false,
  isPlaying = false,
  item,
}: MusicCardSmProps) => {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const href =
    item.id === 'liked-songs' ? ROUTES.likedSongs : ROUTES.playlist(item.id)
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
        <div className="relative h-14 w-14 overflow-hidden rounded-md shadow-md transition-all duration-150 group-hover:shadow-lg">
          {!imageError ? (
            <Image
              alt={item.title}
              className="object-cover"
              fill
              onError={handleImageError}
              sizes="56px"
              src={item.cover}
              unoptimized
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center bg-linear-to-br ${getTypeColor(item.type)}`}
            >
              <span className="text-white text-xs font-bold drop-shadow-sm">
                {item.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {isPlaying && (
            <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-green-500">
              <Volume2 size={12} />
            </span>
          )}
        </div>
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
      <div className="w-12 h-12 relative rounded-md flex-shrink-0 overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-150">
        {!imageError ? (
          <Image
            alt={item.title}
            className="object-cover relative"
            fill
            onError={handleImageError}
            sizes="48px"
            src={item.cover}
            unoptimized
          />
        ) : (
          <div
            className={`w-full h-full bg-linear-to-br ${getTypeColor(item.type)} flex items-center justify-center`}
          >
            <span className="text-white text-xs font-bold drop-shadow-sm">
              {item.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            'font-semibold text-sm truncate group-hover:text-text transition-colors duration-150 leading-tight',
            isPlaying ? 'text-green-500' : 'text-text',
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
          className="shrink-0 text-green-500"
          size={16}
        />
      )}
    </Link>
  )
}
