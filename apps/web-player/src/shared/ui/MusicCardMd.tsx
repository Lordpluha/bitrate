'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface MusicCardMdProps {
  id: string
  name: string
  description?: string
  imageUrl?: string
  onClick?: (id: string) => void
}

export const MusicCardMd: React.FC<MusicCardMdProps> = ({
  id,
  name,
  description,
  imageUrl,
}) => {
  const content = (
    <>
      <Image
        className="flex items-center justify-center object-cover"
        src={imageUrl || '/images/default-playlist.jpg'}
				width={64}
				height={64}
        alt={name}
      />
      <div className="flex-1 flex flex-col justify-center px-4">
        <h3 className="text-white font-medium text-sm">{name}</h3>
        <p className="text-gray-400 text-xs">{description}</p>
      </div>
    </>
  )

  const className =
    'flex bg-gray-800/50 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700/50 transition-all duration-200 flex-1 min-w-0 max-w-[calc(33.333%-0.667rem)]'

  if (id === 'liked-songs') {
    return (
      <Link href="/main/liked-songs" className={className}>
        {content}	
      </Link>
    )
  }

  return (
    <Link href={`/main/playlist/${id}`} className={className}>
      {content}
    </Link>
  )
}
