"use client"
import React, { useState } from 'react'

interface MusicItem {
  id: string
  title: string
  artist: string
  type: 'playlist' | 'album' | 'single' | 'podcast'
  cover: string
  tracksCount?: number
}

interface MusicCardSmProps {
  item: MusicItem
}

const getTypeColor = (type: MusicItem['type']) => {
  switch (type) {
    case 'playlist': return 'from-green-500 to-blue-500'
    case 'album': return 'from-orange-500 to-red-500'
    case 'single': return 'from-purple-500 to-pink-500'
    case 'podcast': return 'from-blue-600 to-indigo-600'
    default: return 'from-gray-500 to-gray-700'
  }
}

export const MusicCardSm = ({ item }: MusicCardSmProps) => {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className='group flex items-center gap-3 p-2 rounded-md hover:bg-white/10 cursor-pointer transition-all duration-150'>
      <div className='w-12 h-12 rounded-md flex-shrink-0 overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-150'>
        {!imageError ? (
          <img
            src={item.cover}
            alt={item.title}
            className='w-full h-full object-cover'
            onError={handleImageError}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getTypeColor(item.type)} flex items-center justify-center`}>
            <span className='text-white text-xs font-bold drop-shadow-sm'>
              {item.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className='flex-1 min-w-0'>
        <h3 className='text-text font-semibold text-sm truncate group-hover:text-white transition-colors duration-150 leading-tight'>
          {item.title}
        </h3>
        <p className='text-gray-400 text-xs truncate group-hover:text-gray-300 transition-colors duration-150 mt-0.5'>
          {item.type.slice(0, 1).toUpperCase() + item.type.slice(1)} • {item.artist}
          {item.tracksCount && ` • ${item.tracksCount} songs`}
        </p>
      </div>
    </div>
  )
}
