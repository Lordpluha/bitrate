'use client'

import { cn } from '@bitrate/ui-react'
import Link from 'next/link'
import {
  getNotificationHref,
  type NotificationResponse,
  useReadNotification,
} from '@/entities/Me'

const notificationDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
})

type NotificationItemProps = {
  notification: NotificationResponse
}

/** One notification; opens its target (a profile, an artist) when it has one and marks it read. */
export const NotificationItem = ({ notification }: NotificationItemProps) => {
  const readNotification = useReadNotification()
  const href = getNotificationHref(notification)
  const className = cn(
    'relative block w-full rounded px-3 py-3 text-left transition-colors hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-white',
    !notification.readAt && 'bg-surface',
  )
  const markRead = () => {
    if (!notification.readAt) readNotification.mutate(notification.id)
  }
  const content = (
    <>
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-sm font-bold">{notification.title}</span>
          <span className="mt-1 block text-xs leading-5 text-text-subdued">
            {notification.body}
          </span>
        </span>
        <span className="shrink-0 text-xs text-text-subdued">
          {notificationDateFormatter.format(notification.createdAt)}
        </span>
      </span>
      {!notification.readAt && (
        <span className="absolute bottom-3 right-3 h-2 w-2 rounded-full bg-primary" />
      )}
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
