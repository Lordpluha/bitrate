import {
  describeNotification,
  notificationTime,
  useNotifications,
} from '@entities/notification'
import { useI18n } from '@shared/i18n'
import { PanelIcon } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import { Activity, Bell } from 'lucide-react'

/** The three latest changes across the artist's releases. */
export function ActivityTile({ artistId }: { artistId: string }) {
  const notifications = useNotifications(artistId)
  const i18n = useI18n()
  const { t } = i18n
  const items = notifications.data?.data.slice(0, 3) ?? []
  return (
    <section
      aria-labelledby="dashboard-activity-heading"
      className="artist-release-workspace-panel"
    >
      <h2 id="dashboard-activity-heading">
        <PanelIcon icon={Activity} />
        {t('dashboard.activity.title')}
      </h2>
      {notifications.isPending ? (
        <p className="mt-3" role="status">
          {t('dashboard.activity.loading')}
        </p>
      ) : items.length === 0 ? (
        <p className="mt-3">{t('dashboard.activity.empty')}</p>
      ) : (
        <ul className="artist-dash-activity">
          {items.map((item) => (
            <li key={item.id}>
              <Bell aria-hidden="true" />
              <Link
                params={{ releaseId: item.releaseId }}
                to="/dashboard/music/$releaseId"
              >
                {describeNotification(item, i18n)} · {item.releaseTitle}
              </Link>
              <span>{notificationTime(item.at, i18n)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
