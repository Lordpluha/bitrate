'use client'

import { Button } from '@bitrate/ui-react'
import { type TranslationKey, useI18n } from '@shared/i18n'
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

const FILTERS: ReadonlyArray<{
  id: NotificationFilter
  labelKey: TranslationKey
}> = [
  { id: 'all', labelKey: 'common.all' },
  { id: 'followers', labelKey: 'notifications.filter.followers' },
  { id: 'friends', labelKey: 'notifications.filter.friends' },
  { id: 'releases', labelKey: 'notifications.filter.releases' },
  { id: 'playlists', labelKey: 'notifications.filter.playlists' },
  { id: 'events', labelKey: 'notifications.filter.events' },
]

/** Every notification, newest first, with filters by kind and Mark all read. */
export const NotificationsPage = () => {
  const { t } = useI18n()
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
              {t('notifications.markAllRead')}
            </Button>
          ) : null
        }
        title={t('notifications.title')}
      />

      <FilterChips
        ariaLabel={t('notifications.show')}
        chips={FILTERS.map(({ id, labelKey }) => ({ id, label: t(labelKey) }))}
        className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0"
        onChange={setFilter}
        value={filter}
      />

      {notifications.isPending ? (
        <ListSkeleton
          className="gap-1"
          label={t('notifications.loading')}
          rowClassName="h-17"
          rows={6}
        />
      ) : notifications.isError ? (
        <ErrorState
          description={t('common.tryAgainSoon')}
          onRetry={() => void notifications.refetch()}
          title={t('notifications.unavailable')}
        />
      ) : visible.length === 0 ? (
        <StateMessage
          description={t('profile.updatesDescription')}
          icon={CircleCheck}
          title={t('profile.caughtUp')}
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
