'use client'

import { cn } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes'
import { MediaImage } from '@shared/ui/MediaImage'
import { getUserAvatarUrl } from '@shared/utils/mediaUrl'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { FriendPresence } from '@/entities/Friend/api/client/friends.schemas'
import { getPresenceLabel } from '@/entities/Friend/lib/friendStatus'
import { useI18n } from '@/shared/i18n'

type PresenceTone = 'away' | 'listening' | 'offline' | 'online'

const toneOf = ({ nowPlaying, status }: FriendPresence): PresenceTone =>
  nowPlaying ? 'listening' : status

const RING: Record<PresenceTone, string> = {
  away: 'ring-2 ring-warning',
  listening: 'ring-2 ring-primary',
  offline: '',
  online: 'ring-2 ring-success',
}

const DOT: Record<PresenceTone, string> = {
  away: 'bg-warning',
  listening: 'bg-primary',
  offline: 'border border-muted-foreground',
  online: 'bg-success',
}

type PersonAvatarProps = {
  avatar: string | null
  presence?: FriendPresence
  size: 44 | 56
}

/** The design's presence avatar: a ring in the presence tone, none when offline. */
const PersonAvatar = ({ avatar, presence, size }: PersonAvatarProps) => (
  <span
    className={cn(
      'relative block shrink-0 overflow-hidden rounded-full bg-secondary ring-offset-2 ring-offset-background',
      size === 44 ? 'size-11' : 'size-14',
      presence && RING[toneOf(presence)],
    )}
  >
    <MediaImage
      alt=""
      className="object-cover"
      fallback="user"
      fill
      sizes={`${size}px`}
      src={getUserAvatarUrl(avatar)}
      unoptimized
    />
  </span>
)

type PersonUser = { avatar: string | null; id: string; username: string }

type FriendRowProps = {
  actions?: ReactNode
  presence: FriendPresence
  user: PersonUser
}

/** The design's Friend Row: presence avatar, name, status line and trailing actions. */
export const FriendRow = ({ actions, presence, user }: FriendRowProps) => {
  const i18n = useI18n()
  const tone = toneOf(presence)

  return (
    <div className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0">
      <Link aria-label={user.username} href={ROUTES.user(user.id)}>
        <PersonAvatar avatar={user.avatar} presence={presence} size={44} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-0.75">
        <Link
          className="truncate text-sm font-semibold text-foreground hover:underline"
          href={ROUTES.user(user.id)}
        >
          {user.username}
        </Link>
        <span className="flex min-w-0 items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn('size-2 shrink-0 rounded-full', DOT[tone])}
          />
          <span
            className={cn(
              'truncate text-xs',
              tone === 'listening' ? 'text-accent' : 'text-muted-foreground',
            )}
          >
            {getPresenceLabel({ i18n, presence })}
          </span>
        </span>
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
      ) : null}
    </div>
  )
}

type FriendTileProps = { presence: FriendPresence; user: PersonUser }

/** The design's Friend Tile for the Online now strip. */
export const FriendTile = ({ presence, user }: FriendTileProps) => (
  <Link
    aria-label={user.username}
    className="flex w-18 shrink-0 flex-col items-center gap-1.5"
    href={ROUTES.user(user.id)}
  >
    <PersonAvatar avatar={user.avatar} presence={presence} size={56} />
    <span className="w-full truncate text-center text-xs font-medium text-foreground">
      {user.username.split(' ')[0]}
    </span>
  </Link>
)

type PersonRowProps = {
  actions?: ReactNode
  meta: string
  user: PersonUser
}

/** The design's People Row: someone who is not (yet) a friend, so no presence. */
export const PersonRow = ({ actions, meta, user }: PersonRowProps) => (
  <div className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0">
    <Link aria-label={user.username} href={ROUTES.user(user.id)}>
      <PersonAvatar avatar={user.avatar} size={44} />
    </Link>
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <Link
        className="truncate text-sm font-semibold text-foreground hover:underline"
        href={ROUTES.user(user.id)}
      >
        {user.username}
      </Link>
      <span className="truncate text-xs text-muted-foreground">{meta}</span>
    </div>
    {actions ? (
      <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
    ) : null}
  </div>
)
