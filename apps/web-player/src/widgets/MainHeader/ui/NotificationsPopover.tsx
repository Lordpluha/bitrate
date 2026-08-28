'use client'

import {
  cn,
  NotificationIcon,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@spotify/ui-react'
import {
  useNotifications,
  useReadAllNotifications,
  useReadNotification,
} from '@/entities/Me'
import { showApiErrorToast } from '@/shared/api/feedback'
import { Z_INDEX_CLASS } from '@/shared/constants'

const notificationDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
})

export const NotificationsPopover = () => {
  const { data, isError, isPending } = useNotifications(1, 20)
  const readNotification = useReadNotification()
  const readAll = useReadAllNotifications()

  const markAllAsRead = () => {
    readAll.mutate(undefined, {
      onError: (error) =>
        showApiErrorToast(error, 'Unable to mark notifications as read.'),
    })
  }

  return (
    <Popover>
      <PopoverTrigger
        aria-label={
          data?.unread
            ? `Notifications, ${data.unread} unread`
            : 'Notifications'
        }
        className="relative rounded-full p-2 text-text-subdued transition-colors hover:bg-surface hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <NotificationIcon className="h-5 w-5" />
        {Boolean(data?.unread) && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className={cn(
          Z_INDEX_CLASS.popover,
          'w-[min(24rem,calc(100vw-2rem))] rounded-md border border-border bg-popover p-0 text-text shadow-2xl',
        )}
        positionerClassName={Z_INDEX_CLASS.popover}
        sideOffset={8}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 className="font-bold">Notifications</h2>
            <p className="text-xs text-text-subdued">
              {data?.unread ?? 0} unread
            </p>
          </div>
          {Boolean(data?.unread) && (
            <button
              className="rounded-full px-3 py-1.5 text-xs font-bold text-text transition-colors hover:bg-surface-hover disabled:opacity-60"
              disabled={readAll.isPending}
              onClick={markAllAsRead}
              type="button"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto p-2 custom-scrollbar">
          {isPending ? (
            <p className="px-3 py-8 text-center text-sm text-text-subdued">
              Loading notifications...
            </p>
          ) : isError ? (
            <p className="px-3 py-8 text-center text-sm text-text-subdued">
              Notifications are unavailable right now.
            </p>
          ) : data?.data.length ? (
            data.data.map((notification) => (
              <button
                className={cn(
                  'relative block w-full rounded px-3 py-3 text-left transition-colors hover:bg-surface-hover',
                  !notification.readAt && 'bg-white/5',
                )}
                key={notification.id}
                onClick={() => {
                  if (!notification.readAt) {
                    readNotification.mutate(notification.id)
                  }
                }}
                type="button"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">
                      {notification.title}
                    </span>
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
              </button>
            ))
          ) : (
            <p className="px-3 py-8 text-center text-sm text-text-subdued">
              You are all caught up.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
