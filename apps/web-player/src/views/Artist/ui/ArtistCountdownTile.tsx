'use client'

import { FollowArtistButton, useArtistCountdown } from '@entities/Artist'
import { MediaImage } from '@shared/ui/MediaImage'
import { getAlbumCoverUrl } from '@shared/utils/mediaUrl'
import { Hourglass } from 'lucide-react'
import { useI18n } from '@/shared/i18n'

const DAY_MS = 86_400_000

export type ArtistCountdownTileProps = {
  artistId: string
  artistName: string
}

/**
 * An upcoming release the artist approved a countdown for (AI promotion, AC-11). It shows only
 * the title, the cover and the date, and nothing while there is no countdown.
 */
export const ArtistCountdownTile = ({
  artistId,
  artistName,
}: ArtistCountdownTileProps) => {
  const { t, tp, locale } = useI18n()
  const { data: countdown } = useArtistCountdown({ artistId })
  if (!countdown) return null

  const releaseAt = new Date(countdown.releaseAt)
  const days = Math.ceil((releaseAt.getTime() - Date.now()) / DAY_MS)
  const date = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  }).format(releaseAt)

  return (
    <section
      aria-labelledby="artist-countdown-title"
      className="flex flex-col gap-4 rounded-[14px] border border-border bg-card p-4 md:max-w-[560px]"
    >
      <div className="flex items-center gap-4">
        <div className="relative size-[72px] shrink-0 overflow-hidden rounded-[9px] md:size-28">
          <MediaImage
            alt={countdown.title}
            className="object-cover"
            fallback="album"
            fill
            sizes="112px"
            src={getAlbumCoverUrl(countdown.cover)}
            unoptimized
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Hourglass aria-hidden="true" size={14} />
            {t('artist.countdown.coming', { date })}
          </p>
          <h2
            className="truncate font-semibold text-lg md:text-xl"
            id="artist-countdown-title"
          >
            {countdown.title}
          </h2>
          <p className="text-muted-foreground text-sm">
            {days > 0
              ? tp({ count: days, key: 'artist.countdown.days' })
              : t('artist.countdown.today')}
          </p>
        </div>
      </div>
      <div>
        <FollowArtistButton artistId={artistId} artistName={artistName} />
      </div>
    </section>
  )
}
