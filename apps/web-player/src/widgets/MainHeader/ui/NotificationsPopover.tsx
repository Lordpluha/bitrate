'use client'

import {
  cn,
  NotificationIcon,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@bitrate/ui-react'
import { StateMessage } from '@shared/ui'
import { CircleCheck, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import {
  NotificationItem,
  useNotifications,
  useReadAllNotifications,
} from '@/entities/Me'
import { Z_INDEX_CLASS } from '@/shared/constants'
import { ROUTES } from '@/shared/routes'

export const NotificationsPopover = () => {
  const { data, isError, isPending } = useNotifications(1, 20)
  const readAll = useReadAllNotifications()

  const markAllAsRead = () => {
    readAll.mutate(undefined)
  }

  return (
    <Popover>
      <PopoverTrigger
        aria-label={
          data?.unread
            ? `Notifications, ${data.unread} unread`
            : 'Notifications'
        }
        className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          'w-[min(24rem,calc(100vw-2rem))] rounded-[10px] border border-border bg-popover p-0 text-foreground shadow-2xl',
        )}
        positionerClassName={Z_INDEX_CLASS.popover}
        sideOffset={8}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-base font-semibold">Notifications</h2>
            <p className="text-xs text-muted-foreground">
              {data?.unread ?? 0} unread
            </p>
          </div>
          {Boolean(data?.unread) && (
            <button
              className="rounded-md px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-60"
              disabled={readAll.isPending}
              onClick={markAllAsRead}
              type="button"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="flex max-h-96 flex-col gap-1 overflow-y-auto p-2 custom-scrollbar">
          {isPending ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Loading notifications...
            </p>
          ) : isError ? (
            <StateMessage
              description="Try again in a moment."
              icon={TriangleAlert}
              size="compact"
              title="Notifications are unavailable"
              tone="error"
            />
          ) : data?.data.length ? (
            data.data.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))
          ) : (
            <StateMessage
              description="Watch this space for news on your followers, playlists, events and more."
              icon={CircleCheck}
              size="compact"
              title="You're all caught up"
            />
          )}
        </div>
        <div className="border-t border-border p-2">
          <Link
            className="flex h-9 items-center justify-center rounded-md text-[13px] font-semibold text-accent transition-colors hover:bg-surface"
            href={ROUTES.notifications}
          >
            Show all
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
