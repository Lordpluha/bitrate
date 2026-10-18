'use client'
import { cn } from '@bitrate/ui-react'
import { fallbackArtistImage, fallbackPlaylistCover } from '@shared/constants'
import { ROUTES } from '@shared/routes'
import { Play } from 'lucide-react'
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

export const resolveMusicCardImage = (
  imageUrl: string | undefined,
  isArtist: boolean | undefined,
) =>
  imageUrl?.trim() || (isArtist ? fallbackArtistImage : fallbackPlaylistCover)

export const MusicCardLg = ({
  id,
  name,
  description,
  href: hrefProp,
  imageUrl,
  isArtist,
}: MusicCardLgProps) => {
  const href = hrefProp ?? (isArtist ? ROUTES.artist(id) : ROUTES.playlist(id))
  const imageSrc = resolveMusicCardImage(imageUrl, isArtist)

  return (
    <Link
      className="group/card flex min-w-45 cursor-pointer flex-col gap-3 rounded-[14px] border border-border bg-card p-3.5 transition-colors duration-300 hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      href={href}
    >
      <div
        className={cn(
          'relative aspect-square overflow-hidden',
          isArtist ? 'rounded-full' : 'rounded-[9px]',
        )}
      >
        <Image
          alt={name}
          className="object-cover transition duration-300 group-hover/card:scale-[1.03]"
          fill
          sizes="180px"
          src={imageSrc}
          unoptimized
        />
        {isArtist ? null : (
          <span className="absolute right-2 bottom-2 flex size-10 translate-y-2 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100">
            <Play
              aria-hidden="true"
              className="ml-0.5"
              fill="currentColor"
              size={18}
            />
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-0.75">
        <h3 className="line-clamp-1 font-[family-name:var(--font-landing-body)] text-[13px] font-semibold text-foreground">
          {name}
        </h3>
        {description ? (
          <p className="line-clamp-1 text-[10px] text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </Link>
  )
}
