'use client'
import React from 'react'
import Link from 'next/link'
import { cn, PlayIcon } from '@spotify/ui-react'

interface MusicCardLgProps {
  id: string
  name: string
  description?: string
  imageUrl?: string
  isArtist?: boolean
}

export const MusicCardLg: React.FC<MusicCardLgProps> = ({
  id,
  name,
  description,
  imageUrl,
  isArtist,
}) => {
  const href = isArtist ? `/artist/${id}` : `/playlist/${id}`

  return (
    <Link
      href={href}
      className="block min-w-[180px] p-4 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-all duration-200 group/card"
    >
      <div className="relative mb-4">
        <img
          src={
            imageUrl ||
            (isArtist
              ? '/images/default-artist.jpg'
              : '/images/default-playlist.jpg')
          }
          alt={name}
          className={cn(
            'w-full aspect-square object-cover',
            isArtist ? 'rounded-full' : 'rounded-md',
          )}
        />
        <div className="absolute bottom-2 right-2 flex items-center justify-center opacity-0 group-hover/card:opacity-100 translate-y-2 group-hover/card:translate-y-0 transition-all duration-200">
          <PlayIcon />
        </div>
      </div>
      <h3 className="text-text font-medium text-sm mb-2 line-clamp-1">
        {name}
      </h3>
      <p className="text-gray-400 text-xs line-clamp-2">{description}</p>
    </Link>
  )
}
