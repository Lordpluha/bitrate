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
import {
  BadgeCheck,
  BellOff,
  CheckCheck,
  CircleAlert,
  CircleCheck,
  Clock3,
  FilePen,
  LoaderCircle,
  MessageSquareWarning,
  Radio,
} from 'lucide-react'

const notificationIcons = {
  CHANGES_REQUESTED: MessageSquareWarning,
  DELIVERY_FAILED: CircleAlert,
  RELEASE_SUBMITTED: Clock3,
  RELEASE_APPROVED: BadgeCheck,
  RELEASE_RELEASED: Radio,
  PUBLISH_FAILED: CircleAlert,
  DELIVERY_LIVE: CircleCheck,
  RELEASE_CHANGES_DECIDED: FilePen,
} as const

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
  const { tMessage, t } = useI18n()

  if (notifications.isPending)
    return (
      <div className="artist-notifications-state" role="status">
        <LoaderCircle
          aria-hidden="true"
          className="size-5 animate-spin motion-reduce:animate-none"
        />
        <p>{t('shell.notifications.loading')}</p>
      </div>
    )
  if (notifications.isError)
    return (
      <div className="artist-notifications-state">
        <p role="alert">{tMessage(notifications.error.message)}</p>
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
      <div className="artist-notifications-state">
        <span aria-hidden="true" className="artist-notifications-empty-icon">
          <BellOff className="size-6" />
        </span>
        <p>{t('shell.notifications.empty')}</p>
      </div>
    )

  const actions = data.filter((item) => item.actionRequired)
  const updates = data.filter((item) => !item.actionRequired)
  return (
    <div className="artist-notifications-content">
      <div className="artist-notifications-toolbar">
        <p className="text-xs text-text-secondary" role="status">
          {unread === 0
            ? t('shell.notifications.caughtUp')
            : t('shell.notifications.unreadCount', { count: unread })}
        </p>
        {unread > 0 && (
          <Button
            className="gap-1.5 text-xs"
            disabled={markSeen.isPending}
            onClick={() => markSeen.mutate()}
            size="sm"
            variant="ghost"
          >
            <CheckCheck aria-hidden="true" className="size-3.5" />
            {t('shell.notifications.markAllRead')}
          </Button>
        )}
      </div>
      {markSeen.error && (
        <p className="px-4 pb-2 text-xs text-destructive" role="alert">
          {tMessage(markSeen.error.message)}
        </p>
      )}
      <div className="artist-notifications-list">
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
  const i18n = useI18n()
  const { t } = i18n
  return (
    <section className="artist-notifications-group">
      <h3 className="px-3 pb-2 pt-1 text-[0.625rem] font-medium uppercase tracking-widest text-text-secondary">
        {title}
      </h3>
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = notificationIcons[item.kind]
          return (
            <li key={item.id}>
              <Link
                className="artist-notification-item"
                data-unread={item.unread}
                onClick={onNavigate}
                params={{ releaseId: item.releaseId }}
                preload={false}
                to="/dashboard/music/$releaseId"
              >
                <span
                  aria-hidden="true"
                  className="artist-notification-icon"
                  data-action={item.actionRequired}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block text-xs leading-relaxed',
                      item.unread && 'font-medium',
                    )}
                  >
                    {describeNotification(item, i18n)}
                    {item.unread && (
                      <span className="sr-only">
                        {' '}
                        {t('shell.notifications.unread')}
                      </span>
                    )}
                  </span>
                  <span
                    className="mt-0.5 block truncate text-[0.6875rem] text-text-secondary"
                    title={item.releaseTitle}
                  >
                    {item.releaseTitle} · {notificationTime(item.at, i18n)}
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
