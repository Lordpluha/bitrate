'use client'
import Image from 'next/image'
import Link from 'next/link'
import type { FC } from 'react'

interface MusicCardMdProps {
  id: string
  name: string
  description?: string
  imageUrl?: string
  onClick?: (id: string) => void
}

export const MusicCardMd: FC<MusicCardMdProps> = ({
  id,
  name,
  description,
  imageUrl,
}) => {
  const content = (
    <>
      <Image
        alt={name}
        className="flex items-center justify-center object-cover"
        height={64}
        src={imageUrl || '/images/default-playlist.jpg'}
        width={64}
      />
      <div className="flex-1 flex flex-col justify-center px-4">
        <h3 className="text-text font-medium text-sm">{name}</h3>
        <p className="text-text-subdued text-xs">{description}</p>
      </div>
    </>
  )

  const className =
    'flex bg-surface hover:bg-surface-hover rounded-lg overflow-hidden cursor-pointer transition-all duration-200 flex-1 min-w-0 max-w-[calc(33.333%-0.667rem)]'

  if (id === 'liked-songs') {
    return (
      <Link className={className} href="/main/liked-songs">
        {content}
      </Link>
    )
  }

  return (
    <Link className={className} href={`/main/playlist/${id}`}>
      {content}
    </Link>
  )
}
