'use client'
import { fallbackPlaylistCover } from '@shared/constants'
import { ROUTES } from '@shared/routes'
import { getPlaylistCoverUrl } from '@shared/utils/mediaUrl'
import Image from 'next/image'
import Link from 'next/link'

interface MusicCardMdProps {
  id: string
  name: string
  description?: string
  imageUrl?: string
  onClick?: (id: string) => void
}

export const MusicCardMd = ({
  id,
  name,
  description,
  imageUrl,
}: MusicCardMdProps) => {
  const imageSrc = getPlaylistCoverUrl(imageUrl || fallbackPlaylistCover)
  const content = (
    <>
      <Image
        alt={name}
        className="flex items-center justify-center object-cover"
        height={64}
        src={imageSrc}
        unoptimized
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
      <Link className={className} href={ROUTES.likedSongs}>
        {content}
      </Link>
    )
  }

  return (
    <Link className={className} href={ROUTES.playlist(id)}>
      {content}
    </Link>
  )
}
