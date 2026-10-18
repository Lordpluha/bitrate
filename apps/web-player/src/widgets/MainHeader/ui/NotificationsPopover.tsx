'use client'

import {
  cn,
  NotificationIcon,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@bitrate/ui-react'
import { useNotifications, useReadAllNotifications } from '@/entities/Me'
import { showApiErrorToast } from '@/shared/api/feedback'
import { Z_INDEX_CLASS } from '@/shared/constants'
import { NotificationItem } from './NotificationItem'

export const NotificationsPopover = () => {
  const { data, isError, isPending } = useNotifications(1, 20)
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
        <NotificationIcon className="size-5 xl:size-4.5" />
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
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
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
