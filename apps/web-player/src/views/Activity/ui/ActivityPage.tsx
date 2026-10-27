'use client'

import { Button } from '@bitrate/ui-react'
import { ArtistName } from '@entities/Artist'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import {
  ErrorState,
  ListSkeleton,
  PageShell,
  PageTitle,
  StateMessage,
} from '@shared/ui'
import { MediaImage } from '@shared/ui/MediaImage'
import { formatRelativeTime } from '@shared/utils/formatRelativeTime'
import { getTrackCoverUrl, getUserAvatarUrl } from '@shared/utils/mediaUrl'
import { Play, UsersRound } from 'lucide-react'
import Link from 'next/link'
import { getActivityAction, useFollowingActivity } from '@/entities/User'
import { usePlayCollection } from '@/features/PlayCollection'

/**
 * The design's Activity feed: what each person you follow played last this week, newest
 * first, with Play beside every track. The API only reports plays, so the design's
 * Likes and Playlists filters wait for it.
 */
export const ActivityPage = () => {
  const { locale, t } = useI18n()
  const activity = useFollowingActivity()
  const playCollection = usePlayCollection()

  return (
    <PageShell>
      <PageTitle title={t('activity.title')} />

      {activity.isPending ? (
        <ListSkeleton
          className="gap-1"
          label={t('activity.loading')}
          rowClassName="h-20"
          rows={6}
        />
      ) : activity.isError ? (
        <ErrorState
          description={t('common.tryAgainSoon')}
          onRetry={() => void activity.refetch()}
          title={t('activity.unavailable')}
        />
      ) : activity.data.length === 0 ? (
        <StateMessage
          description={t('activity.emptyDescription')}
          icon={UsersRound}
          primary={{
            href: ROUTES.search(),
            label: t('activity.findPeople'),
          }}
          title={t('activity.emptyTitle')}
        />
      ) : (
        <ul className="flex flex-col">
          {activity.data.map(({ listenedAt, track, user }) => (
            <li
              className="flex items-center gap-3.5 border-b border-border px-1 py-3.5 last:border-b-0 md:px-4"
              key={user.id}
            >
              <Link
                aria-label={user.username}
                className="relative size-11 shrink-0 overflow-hidden rounded-full bg-secondary"
                href={ROUTES.user(user.id)}
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
                    href={ROUTES.user(user.id)}
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
                      href={ROUTES.artist(track.artistId)}
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
                onClick={() =>
                  void playCollection({
                    id: track.id,
                    kind: 'track',
                    title: track.title,
                  })
                }
                variant="outline"
              >
                <Play className="size-4 fill-current" />
                <span className="hidden sm:inline">{t('common.play')}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  )
}
