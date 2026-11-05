import type { ArtistDashboard } from '@entities/dashboard'
import { releaseCoverUrl, releaseStatusLabels } from '@entities/release'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { PanelIcon } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import { CalendarClock, CalendarPlus, ChevronRight, Music2 } from 'lucide-react'
import { COMING_UP_LIMIT, comingUp } from '../lib/comingUp'

/** Planned release dates across the catalogue, soonest first, with room to plan another. */
export function ComingUpTile({ dashboard }: { dashboard: ArtistDashboard }) {
  const { t, locale } = useI18n()
  const items = comingUp(dashboard.upcoming)
  const shortDate = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  })
  const shortTime = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
  return (
    <section
      aria-labelledby="dashboard-upcoming-heading"
      className="artist-release-workspace-panel artist-dash-upcoming"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="dashboard-upcoming-heading">
          <PanelIcon icon={CalendarClock} />
          {t('dashboard.upcoming.title')}
        </h2>
        <span className="text-xs text-text-secondary">UTC</span>
      </div>
      {items.length === 0 ? (
        <p className="mt-3">{t('dashboard.upcoming.empty')}</p>
      ) : (
        <ol className="artist-dash-timeline">
          {items.map((item, index) => (
            <li data-first={index === 0} key={item.key}>
              <Link
                params={{ releaseId: item.releaseId }}
                to="/dashboard/music/$releaseId"
              >
                <time className="artist-dash-timeline-date" dateTime={item.at}>
                  <span>
                    {shortDate.format(new Date(item.at)).toUpperCase()}
                  </span>
                  <span>{shortTime.format(new Date(item.at))}</span>
                </time>
                {item.cover ? (
                  <img alt="" src={releaseCoverUrl(item.cover)} />
                ) : (
                  <span className="artist-release-cover-placeholder">
                    <Music2 aria-hidden="true" />
                  </span>
                )}
                <span className="artist-dash-timeline-meta">
                  <span className="artist-release-row-title">{item.title}</span>
                  <span
                    className="artist-dash-releases-status"
                    data-status={item.status}
                  >
                    {t(releaseStatusLabels[item.status])}
                  </span>
                </span>
                <ChevronRight aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      )}
      {items.length < COMING_UP_LIMIT && (
        <Link
          className="artist-dash-upcoming-slot"
          search={{ tab: 'releases', page: 1 }}
          to={ROUTES.dashboard.music}
        >
          <CalendarPlus aria-hidden="true" />
          {t('dashboard.upcoming.planNext')}
        </Link>
      )}
    </section>
  )
}
