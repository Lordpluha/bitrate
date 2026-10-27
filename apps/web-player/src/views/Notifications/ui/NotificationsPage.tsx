'use client'

import { Button } from '@bitrate/ui-react'
import {
  ErrorState,
  FilterChips,
  ListSkeleton,
  PageShell,
  PageTitle,
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

      <FilterChips
        ariaLabel="Show"
        chips={FILTERS}
        className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0"
        onChange={setFilter}
        value={filter}
      />

      {notifications.isPending ? (
        <ListSkeleton
          className="gap-1"
          label="Loading notifications"
          rowClassName="h-17"
          rows={6}
        />
      ) : notifications.isError ? (
        <ErrorState
          description="Try again in a moment."
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
