import { Button, cn } from '@bitrate/ui-react'
import {
  type ArtistNotification,
  describeNotification,
  notificationTime,
  useMarkNotificationsSeen,
  useNotifications,
} from '@entities/notification'
import { useI18n } from '@shared/i18n'
import { Link } from '@tanstack/react-router'
import { BellOff, CircleAlert, Info } from 'lucide-react'

interface DashboardNotificationsProps {
  artistId: string
  onNavigate: () => void
}

/** Notification center: what needs action first, then updates, unread items marked. */
export function DashboardNotifications({
  artistId,
  onNavigate,
}: DashboardNotificationsProps) {
  const notifications = useNotifications(artistId)
  const markSeen = useMarkNotificationsSeen(artistId)
  const { t } = useI18n()

  if (notifications.isPending)
    return <p role="status">{t('shell.notifications.loading')}</p>
  if (notifications.isError)
    return (
      <div className="space-y-3">
        <p role="alert">{notifications.error.message}</p>
        <Button
          onClick={() => {
            void notifications.refetch()
          }}
          variant="outline"
        >
          {t('common.tryAgain')}
        </Button>
      </div>
    )

  const { data, unread } = notifications.data
  if (data.length === 0)
    return (
      <div className="flex items-start gap-3 text-sm text-text-secondary">
        <BellOff aria-hidden="true" className="size-5 shrink-0" />
        <p>{t('shell.notifications.empty')}</p>
      </div>
    )

  const actions = data.filter((item) => item.actionRequired)
  const updates = data.filter((item) => !item.actionRequired)
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-text-secondary" role="status">
          {unread === 0
            ? t('shell.notifications.caughtUp')
            : t('shell.notifications.unreadCount', { count: unread })}
        </p>
        {unread > 0 && (
          <Button
            disabled={markSeen.isPending}
            onClick={() => markSeen.mutate()}
            size="sm"
            variant="outline"
          >
            {t('shell.notifications.markAllRead')}
          </Button>
        )}
      </div>
      {markSeen.error && (
        <p className="text-sm text-destructive" role="alert">
          {markSeen.error.message}
        </p>
      )}
      {actions.length > 0 && (
        <NotificationGroup
          items={actions}
          onNavigate={onNavigate}
          title={t('shell.notifications.actionRequired')}
        />
      )}
      {updates.length > 0 && (
        <NotificationGroup
          items={updates}
          onNavigate={onNavigate}
          title={t('shell.notifications.updates')}
        />
      )}
    </div>
  )
}

function NotificationGroup({
  title,
  items,
  onNavigate,
}: {
  title: string
  items: ArtistNotification[]
  onNavigate: () => void
}) {
  const { t } = useI18n()
  return (
    <section className="space-y-1">
      <h3 className="text-xs uppercase tracking-wide text-text-secondary">
        {title}
      </h3>
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.actionRequired ? CircleAlert : Info
          return (
            <li key={item.id}>
              <Link
                className={cn(
                  'flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  item.unread && 'bg-secondary/60',
                )}
                onClick={onNavigate}
                params={{ releaseId: item.releaseId }}
                preload={false}
                to="/dashboard/music/$releaseId"
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 size-4 shrink-0',
                    item.actionRequired ? 'text-destructive' : 'text-accent',
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block text-sm',
                      item.unread && 'font-medium',
                    )}
                  >
                    {describeNotification(item)}
                    {item.unread && (
                      <span className="sr-only">
                        {' '}
                        {t('shell.notifications.unread')}
                      </span>
                    )}
                  </span>
                  <span className="block truncate text-xs text-text-secondary">
                    {item.releaseTitle} · {notificationTime(item.at)}
                  </span>
                </span>
                {item.unread && (
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-2 shrink-0 rounded-full bg-accent"
                  />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
