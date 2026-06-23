'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface MusicItem {
  id: string
  title: string
  username: string
  type: 'playlist' | 'album' | 'single' | 'podcast'
  cover: string
  tracksCount?: number
}

interface MusicCardSmProps {
  item: MusicItem
}

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

export const MusicCardSm = ({ item }: MusicCardSmProps) => {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const href =
    item.id === 'liked-songs'
      ? '/main/liked-songs'
      : `/main/playlist/${item.id}`

  return (
    <Link
      className="group flex items-center gap-3 p-2 rounded-md hover:bg-surface cursor-pointer transition-all duration-150"
      href={href}
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
        <h3 className="text-text font-semibold text-sm truncate group-hover:text-text transition-colors duration-150 leading-tight">
          {item.title}
        </h3>
        <p className="text-text-subdued text-xs truncate group-hover:text-text-secondary transition-colors duration-150 mt-0.5">
          {item.type.slice(0, 1).toUpperCase() + item.type.slice(1)} •{' '}
          {item.username}
          {item.tracksCount && ` • ${item.tracksCount} songs`}
        </p>
      </div>
    </Link>
  )
}
