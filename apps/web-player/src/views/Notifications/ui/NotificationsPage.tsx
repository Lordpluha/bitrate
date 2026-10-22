'use client'

import { Button, cn } from '@bitrate/ui-react'
import {
  ListSkeleton,
  PageShell,
  PageTitle,
  RetryState,
  StateMessage,
} from '@shared/ui'
import { CircleCheck } from 'lucide-react'
import { useState } from 'react'
import {
  filterNotifications,
  type NotificationFilter,
  NotificationItem,
  useNotifications,
  useReadAllNotifications,
} from '@/entities/Me'

/** How many notifications the page loads; older ones wait for paging. */
const PAGE_SIZE = 100

const FILTERS: ReadonlyArray<{ id: NotificationFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'followers', label: 'Followers' },
  { id: 'friends', label: 'Friends' },
  { id: 'releases', label: 'Releases' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'events', label: 'Events' },
]

/** Every notification, newest first, with filters by kind and Mark all read. */
export const NotificationsPage = () => {
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const notifications = useNotifications(1, PAGE_SIZE)
  const readAll = useReadAllNotifications()
  const visible = filterNotifications({
    filter,
    notifications: notifications.data?.data ?? [],
  })

  return (
    <PageShell>
      <PageTitle
        action={
          notifications.data?.unread ? (
            <Button
              className="h-9 px-4 text-sm font-medium"
              disabled={readAll.isPending}
              onClick={() => readAll.mutate(undefined)}
              variant="ghost"
            >
              Mark all read
            </Button>
          ) : null
        }
        title="Notifications"
      />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {FILTERS.map(({ id, label }) => (
          <button
            aria-pressed={filter === id}
            className={cn(
              'flex h-8 shrink-0 items-center rounded-full border px-3.5 text-[13px] text-foreground transition-colors',
              filter === id
                ? 'border-primary bg-primary font-semibold text-primary-foreground'
                : 'border-border hover:bg-surface',
            )}
            key={id}
            onClick={() => setFilter(id)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {notifications.isPending ? (
        <ListSkeleton
          className="gap-1"
          label="Loading notifications"
          rowClassName="h-17"
          rows={6}
        />
      ) : notifications.isError ? (
        <RetryState
          onRetry={() => void notifications.refetch()}
          title="Notifications are unavailable right now."
        />
      ) : visible.length === 0 ? (
        <StateMessage
          description="Watch this space for news on your followers, playlists, events and more."
          icon={CircleCheck}
          title="You're all caught up"
        />
      ) : (
        <ul className="flex flex-col gap-1">
          {visible.map((notification) => (
            <li key={notification.id}>
              <NotificationItem notification={notification} />
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  )
}
