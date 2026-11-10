'use client'

import { Button } from '@bitrate/ui-react'
import { ArtistName } from '@entities/Artist'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import { MediaImage } from '@shared/ui/MediaImage'
import { formatRelativeTime } from '@shared/utils/formatRelativeTime'
import { getTrackCoverUrl, getUserAvatarUrl } from '@shared/utils/mediaUrl'
import { Play } from 'lucide-react'
import Link from 'next/link'
import type { FollowingActivityEntry } from '@/entities/User/api/client/userResponse.schema'
import { getActivityAction } from '@/entities/User/lib/activityAction'

type ActivityRowProps = {
  entry: FollowingActivityEntry
  /** Plays the entry's track. */
  onPlay: () => void
}

/**
 * The design's Activity Row: the listener, what they played and when, the cover and Play.
 */
export const ActivityRow = ({
  entry: { listenedAt, track, user },
  onPlay,
}: ActivityRowProps) => {
  const { locale, t } = useI18n()

  return (
    <li className="flex items-center gap-3.5 border-b border-border px-1 py-3.5 last:border-b-0 md:px-4">
      <Link
        aria-label={user.username}
        className="relative size-11 shrink-0 overflow-hidden rounded-full bg-secondary"
        href={ROUTES.user(user.username)}
      >
        <MediaImage
          alt=""
          className="object-cover"
          fallback="user"
          fill
          sizes="44px"
          src={getUserAvatarUrl(user.avatar)}
          unoptimized
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-sm">
        <p className="truncate text-muted-foreground">
          <Link
            className="font-semibold text-foreground hover:underline"
            href={ROUTES.user(user.username)}
          >
            {user.username}
          </Link>{' '}
          {getActivityAction({ listenedAt, t })}
        </p>
        <p className="truncate font-semibold text-foreground">
          {track.title}
          <span className="font-normal text-muted-foreground">
            {' · '}
            <Link
              className="hover:text-foreground hover:underline"
              href={
                track.artist?.username
                  ? ROUTES.artist(track.artist.username)
                  : ROUTES.artistById(track.artistId)
              }
            >
              {track.artist?.username ?? (
                <ArtistName artistId={track.artistId} />
              )}
            </Link>
          </span>
        </p>
        <time
          className="text-xs text-muted-foreground"
          dateTime={listenedAt.toISOString()}
        >
          {formatRelativeTime({ date: listenedAt, locale })}
        </time>
      </div>
      <MediaImage
        alt=""
        className="hidden size-13 shrink-0 rounded-md object-cover sm:block"
        fallback="track"
        height={52}
        src={getTrackCoverUrl(track.cover)}
        unoptimized
        width={52}
      />
      <Button
        aria-label={t('common.playName', { name: track.title })}
        className="h-9 shrink-0 gap-1.5 px-3 text-sm font-medium"
        onClick={onPlay}
        variant="outline"
      >
        <Play className="size-4 fill-current" />
        <span className="hidden sm:inline">{t('common.play')}</span>
      </Button>
    </li>
  )
}
