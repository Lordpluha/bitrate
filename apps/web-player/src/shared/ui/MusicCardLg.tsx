'use client'
import { cn } from '@bitrate/ui-react'
import { fallbackArtistImage, fallbackPlaylistCover } from '@shared/constants'
import { ROUTES } from '@shared/routes'
import { MediaImage } from '@shared/ui/MediaImage'
import { Play } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/shared/i18n'

interface MusicCardLgProps {
  id: string
  name: string
  description?: string
  href?: string
  imageUrl?: string
  isArtist?: boolean
  /** Starts the album, playlist or track at once; the rest of the card still opens it. */
  onPlay?: () => void
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
  onPlay,
}: MusicCardLgProps) => {
  const { t } = useI18n()
  const href = hrefProp ?? (isArtist ? ROUTES.artist(id) : ROUTES.playlist(id))
  const imageSrc = resolveMusicCardImage(imageUrl, isArtist)

  return (
    <div className="group/card relative flex min-w-45 flex-col gap-3 rounded-[14px] border border-border bg-card p-3.5 transition-colors duration-300 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring hover:bg-secondary">
      <div
        className={cn(
          'relative aspect-square overflow-hidden',
          isArtist ? 'rounded-full' : 'rounded-[9px]',
        )}
      >
        <MediaImage
          alt=""
          className="object-cover transition duration-300 group-hover/card:scale-[1.03]"
          fallback={isArtist ? 'artist' : 'playlist'}
          fill
          sizes="180px"
          src={imageSrc}
          unoptimized
        />
        {onPlay ? (
          <button
            aria-label={t('common.playName', { name })}
            className="absolute right-2 bottom-2 z-10 flex size-10 translate-y-2 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100 hover:scale-105 focus-visible:translate-y-0 focus-visible:opacity-100"
            onClick={onPlay}
            type="button"
          >
            <Play
              aria-hidden="true"
              className="ml-0.5"
              fill="currentColor"
              size={18}
            />
          </button>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col gap-0.75">
        <Link
          className="line-clamp-1 text-[13px] font-semibold text-foreground outline-none after:absolute after:inset-0 after:rounded-[14px]"
          href={href}
        >
          {name}
        </Link>
        {description ? (
          <p className="line-clamp-1 text-[10px] text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}
