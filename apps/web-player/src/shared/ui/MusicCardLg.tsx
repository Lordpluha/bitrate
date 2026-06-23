'use client'
import { fallbackPlaylistCover } from '@shared/constants'
import { getStaticMediaUrl } from '@shared/utils/mediaUrl'
import { cn, PlayIcon } from '@spotify/ui-react'
import Image from 'next/image'
import Link from 'next/link'
import type { FC } from 'react'

interface MusicCardLgProps {
  id: string
  name: string
  description?: string
  imageUrl?: string
  isArtist?: boolean
}

export const MusicCardLg: FC<MusicCardLgProps> = ({
  id,
  name,
  description,
  imageUrl,
  isArtist,
}) => {
  const href = isArtist ? `/main/artist/${id}` : `/main/playlist/${id}`
  const fallbackImage = isArtist
    ? '/images/default-artist.jpg'
    : fallbackPlaylistCover
  const imageSrc = isArtist
    ? getStaticMediaUrl(imageUrl, 'artists/avatars', fallbackImage)
    : getStaticMediaUrl(imageUrl, 'playlists/covers', fallbackImage)

  return (
    <Link
      className="block min-w-45 p-4 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-all duration-200 group/card"
      href={href}
    >
      <div className="relative mb-4 aspect-square">
        <Image
          alt={name}
          className={cn(
            'object-cover',
            isArtist ? 'rounded-full' : 'rounded-md',
          )}
          fill
          sizes="180px"
          src={imageSrc}
          unoptimized
        />
        <div className="absolute bottom-2 right-2 flex items-center justify-center opacity-0 group-hover/card:opacity-100 translate-y-2 group-hover/card:translate-y-0 transition-all duration-200">
          <PlayIcon height={48} width={48} />
        </div>
      </div>
      <h3 className="text-text font-medium text-sm mb-2 line-clamp-1">
        {name}
      </h3>
      <p className="text-gray-400 text-xs line-clamp-2">{description}</p>
    </Link>
  )
}
