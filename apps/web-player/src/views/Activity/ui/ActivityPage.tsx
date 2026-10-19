'use client'

import { Button } from '@bitrate/ui-react'
import { ArtistName } from '@entities/Artist'
import { ROUTES } from '@shared/routes'
import { PageTitle, Skeleton, StateMessage } from '@shared/ui'
import { MediaImage } from '@shared/ui/MediaImage'
import { formatRelativeTime } from '@shared/utils/formatRelativeTime'
import { getTrackCoverUrl, getUserAvatarUrl } from '@shared/utils/mediaUrl'
import { Play, TriangleAlert, UsersRound } from 'lucide-react'
import Link from 'next/link'
import { getActivityAction, useFollowingActivity } from '@/entities/User'
import { usePlayCollection } from '@/features/PlayCollection'

const SKELETON_KEYS = Array.from({ length: 6 }, (_, row) => `activity-${row}`)

const ActivityLoading = () => (
  <div
    aria-label="Loading activity"
    className="flex flex-col gap-1"
    role="status"
  >
    {SKELETON_KEYS.map((key) => (
      <Skeleton className="h-20 rounded-[10px]" key={key} />
    ))}
  </div>
)

/**
 * The design's Activity feed: what each person you follow played last this week, newest
 * first, with Play beside every track. The API only reports plays, so the design's
 * Likes and Playlists filters wait for it.
 */
export const ActivityPage = () => {
  const activity = useFollowingActivity()
  const playCollection = usePlayCollection()

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="flex max-w-190 flex-col gap-5 px-4 pt-2 pb-3 md:gap-6 md:px-8 md:py-6">
        <PageTitle title="Activity" />

        {activity.isPending ? (
          <ActivityLoading />
        ) : activity.isError ? (
          <StateMessage
            description="Try again in a moment."
            icon={TriangleAlert}
            primary={{
              label: 'Try again',
              onClick: () => void activity.refetch(),
            }}
            title="Activity is unavailable"
            tone="error"
          />
        ) : activity.data.length === 0 ? (
          <StateMessage
            description="What they play shows up here, unless they keep their listening private."
            icon={UsersRound}
            primary={{ href: ROUTES.search(), label: 'Find people to follow' }}
            title="Follow listeners to see their activity"
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
                    {getActivityAction({ listenedAt })}
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
                    {formatRelativeTime({ date: listenedAt })}
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
                  aria-label={`Play ${track.title}`}
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
                  <span className="hidden sm:inline">Play</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
