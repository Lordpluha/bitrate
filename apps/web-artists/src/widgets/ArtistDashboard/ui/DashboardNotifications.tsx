import { Button, cn } from '@bitrate/ui-react'
import {
  type ArtistNotification,
  describeNotification,
  notificationTime,
  useMarkNotificationsSeen,
  useNotifications,
} from '@entities/notification'
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

  if (notifications.isPending)
    return <p role="status">Loading notifications…</p>
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
          Try again
        </Button>
      </div>
    )

  const { data, unread } = notifications.data
  if (data.length === 0)
    return (
      <div className="flex items-start gap-3 text-sm text-text-secondary">
        <BellOff aria-hidden="true" className="size-5 shrink-0" />
        <p>
          No notifications. Deadlines, review results and delivery updates will
          appear here.
        </p>
      </div>
    )

  const actions = data.filter((item) => item.actionRequired)
  const updates = data.filter((item) => !item.actionRequired)
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-text-secondary" role="status">
          {unread === 0 ? 'All caught up' : `${unread} unread`}
        </p>
        {unread > 0 && (
          <Button
            disabled={markSeen.isPending}
            onClick={() => markSeen.mutate()}
            size="sm"
            variant="outline"
          >
            Mark all as read
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
          title="Action required"
        />
      )}
      {updates.length > 0 && (
        <NotificationGroup
          items={updates}
          onNavigate={onNavigate}
          title="Updates"
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
                    {item.unread && <span className="sr-only"> (unread)</span>}
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
