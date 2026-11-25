'use client'

import { cn } from '@bitrate/ui-react'
import {
  Bell,
  Disc3,
  HeartHandshake,
  ListMusic,
  Sparkles,
  UserCheck,
  UserPlus,
} from 'lucide-react'
import Link from 'next/link'
import { useReadNotification } from '@/entities/Me/api/client/hooks'
import type { NotificationResponse } from '@/entities/Me/api/client/me.schemas'
import { getNotificationArtistMessage } from '@/entities/Me/lib/notificationArtistMessage'
import { getNotificationHref } from '@/entities/Me/lib/notificationHref'
import { useI18n } from '@/shared/i18n'
import { formatDate } from '@/shared/utils/formatDate'

const NOTIFICATION_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
}

const ICON_BY_TYPE = {
  FOLLOW: UserPlus,
  FRIEND_ACCEPTED: UserCheck,
  FRIEND_REQUEST: HeartHandshake,
  NEW_RELEASE: Disc3,
  PLAYLIST_UPDATE: ListMusic,
  SYSTEM: Bell,
} as const satisfies Record<NotificationResponse['type'], typeof Bell>

type NotificationItemProps = {
  notification: NotificationResponse
}

/**
 * The design's Notification Row: an icon for its kind, the title and text, when it arrived and
 * an unread dot. Opens its target (a profile, an artist) when it has one and marks it read.
 */
export const NotificationItem = ({ notification }: NotificationItemProps) => {
  const { locale, t } = useI18n()
  const readNotification = useReadNotification()
  const href = getNotificationHref(notification)
  const artistMessage = getNotificationArtistMessage({
    payload: notification.payload,
  })
  const Icon = ICON_BY_TYPE[notification.type]
  const isUnread = !notification.readAt
  const className = cn(
    'flex w-full items-center gap-3.5 rounded-[10px] px-4 py-3.5 text-left transition-colors hover:bg-surface focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
    isUnread && 'bg-muted',
  )
  const markRead = () => {
    if (isUnread) readNotification.mutate(notification.id)
  }
  const content = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
        <Icon aria-hidden="true" size={18} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground">
          {notification.title}
        </span>
        {notification.body ? (
          <span className="line-clamp-2 text-[13px] text-muted-foreground">
            {notification.body}
          </span>
        ) : null}
        {artistMessage ? (
          <span className="line-clamp-3 text-[13px] text-foreground italic">
            “{artistMessage.text}”
          </span>
        ) : null}
        {artistMessage?.aiGenerated ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles aria-hidden="true" size={12} />
            {t('notifications.createdWithAi')}
          </span>
        ) : null}
        <span className="text-xs text-muted-foreground">
          {formatDate({
            date: notification.createdAt,
            locale,
            options: NOTIFICATION_DATE_OPTIONS,
          })}
        </span>
      </span>
      {isUnread ? (
        <span
          aria-label={t('common.unread')}
          className="size-2 shrink-0 rounded-full bg-primary"
          role="img"
        />
      ) : null}
    </>
  )

  return href ? (
    <Link className={className} href={href} onClick={markRead}>
      {content}
    </Link>
  ) : (
    <button className={className} onClick={markRead} type="button">
      {content}
    </button>
  )
}
