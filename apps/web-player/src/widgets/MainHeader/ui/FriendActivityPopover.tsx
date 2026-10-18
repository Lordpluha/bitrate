'use client'

import {
  cn,
  MembersIcon,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@bitrate/ui-react'
import { MediaImage } from '@shared/ui/MediaImage'
import Link from 'next/link'
import { useState } from 'react'
import { useFollowingActivity } from '@/entities/User'
import { Z_INDEX_CLASS } from '@/shared/constants'
import { ROUTES } from '@/shared/routes'
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime'
import { getTrackCoverUrl, getUserAvatarUrl } from '@/shared/utils/mediaUrl'

/** What the people you follow last played; fetched only while the panel is open. */
export const FriendActivityPopover = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { data, isError, isPending } = useFollowingActivity(isOpen)

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger
        aria-label="Friend activity"
        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MembersIcon className="size-5 xl:size-4.5" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className={cn(
          Z_INDEX_CLASS.popover,
          'w-[min(22rem,calc(100vw-2rem))] rounded-md border border-border bg-popover p-0 text-text shadow-2xl',
        )}
        positionerClassName={Z_INDEX_CLASS.popover}
        sideOffset={8}
      >
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-bold">Friend activity</h2>
          <p className="text-xs text-text-subdued">
            What people you follow played this week
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 custom-scrollbar">
          {isPending ? (
            <p
              className="px-3 py-8 text-center text-sm text-text-subdued"
              role="status"
            >
              Loading friend activity…
            </p>
          ) : isError ? (
            <p
              className="px-3 py-8 text-center text-sm text-text-subdued"
              role="status"
            >
              Friend activity is unavailable right now.
            </p>
          ) : data.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-text-subdued">
              When people you follow listen to music, it shows up here.
            </p>
          ) : (
            <ul className="grid gap-1">
              {data.map(({ listenedAt, track, user }) => (
                <li
                  className="flex items-center gap-3 rounded px-3 py-2"
                  key={user.id}
                >
                  <Link
                    aria-label={user.username}
                    className="relative size-10 shrink-0 overflow-hidden rounded-full bg-surface"
                    href={ROUTES.user(user.id)}
                  >
                    <MediaImage
                      alt=""
                      className="object-cover"
                      fallback="user"
                      fill
                      sizes="40px"
                      src={getUserAvatarUrl(user.avatar)}
                      unoptimized
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <Link
                        className="truncate text-sm font-bold hover:underline"
                        href={ROUTES.user(user.id)}
                      >
                        {user.username}
                      </Link>
                      <time
                        className="shrink-0 text-xs text-text-subdued"
                        dateTime={listenedAt.toISOString()}
                      >
                        {formatRelativeTime({ date: listenedAt })}
                      </time>
                    </div>
                    <Link
                      className="flex min-w-0 items-center gap-2 text-xs text-text-subdued hover:text-text"
                      href={ROUTES.artist(track.artistId)}
                    >
                      <span className="relative size-4 shrink-0 overflow-hidden rounded-sm bg-surface">
                        <MediaImage
                          alt=""
                          className="object-cover"
                          fallback="track"
                          fill
                          sizes="16px"
                          src={getTrackCoverUrl(track.cover)}
                          unoptimized
                        />
                      </span>
                      <span className="truncate">{track.title}</span>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
