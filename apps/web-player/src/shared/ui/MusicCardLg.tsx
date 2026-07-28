'use client'
import { fallbackPlaylistCover } from '@shared/constants'
import { ROUTES } from '@shared/routes'
import { getArtistAvatarUrl, getPlaylistCoverUrl } from '@shared/utils/mediaUrl'
import { cn, PlayIcon } from '@spotify/ui-react'
import Image from 'next/image'
import Link from 'next/link'

interface MusicCardLgProps {
  id: string
  name: string
  description?: string
  href?: string
  imageUrl?: string
  isArtist?: boolean
}

export const MusicCardLg = ({
  id,
  name,
  description,
  href: hrefProp,
  imageUrl,
  isArtist,
}: MusicCardLgProps) => {
  const href =
    hrefProp ?? (isArtist ? `/main/artist/${id}` : ROUTES.playlist(id))
  const fallbackImage = isArtist
    ? getArtistAvatarUrl(imageUrl)
    : fallbackPlaylistCover
  const imageSrc = isArtist ? fallbackImage : getPlaylistCoverUrl(imageUrl)

  return (
    <Link
      className="group/card block min-w-45 cursor-pointer rounded-lg p-3 transition-colors duration-300 hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      href={href}
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-md shadow-lg shadow-black/20">
        <Image
          alt={name}
          className={cn(
            'object-cover transition duration-300 group-hover/card:scale-[1.03] group-hover/card:brightness-75',
            isArtist ? 'rounded-full' : 'rounded-md',
          )}
          fill
          sizes="180px"
          src={imageSrc}
          unoptimized
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
        <div className="absolute bottom-2 right-2 flex translate-y-2 scale-95 items-center justify-center opacity-0 transition duration-300 group-hover/card:translate-y-0 group-hover/card:scale-100 group-hover/card:opacity-100">
          <PlayIcon height={48} width={48} />
        </div>
      </div>
      <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-text">
        {name}
      </h3>
      <p className="line-clamp-2 text-xs leading-5 text-text-subdued">
        {description}
      </p>
    </Link>
  )
}
