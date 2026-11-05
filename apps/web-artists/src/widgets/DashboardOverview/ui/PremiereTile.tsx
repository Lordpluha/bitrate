import type { ArtistDashboard } from '@entities/dashboard'
import { releaseCoverUrl, releaseStatusLabels } from '@entities/release'
import { useI18n } from '@shared/i18n'
import { Countdown, PanelIcon } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import { Music2, Timer } from 'lucide-react'
import { comingUp, nextPremieres } from '../lib/comingUp'

/**
 * A live countdown to the soonest planned moment and the releases landing then. Later dates
 * belong to Coming up, so this tile only grows when releases share that exact moment.
 */
export function PremiereTile({ dashboard }: { dashboard: ArtistDashboard }) {
  const { t, locale } = useI18n()
  const premieres = nextPremieres(comingUp(dashboard.upcoming), Date.now())
  const lead = premieres[0]
  const moment = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  })
  return (
    <section
      aria-labelledby="dashboard-premiere-heading"
      className="artist-release-workspace-panel artist-dash-premiere"
    >
      {lead?.cover && (
        <span aria-hidden="true" className="artist-cover-wash">
          <img alt="" src={releaseCoverUrl(lead.cover)} />
        </span>
      )}
      <h2 id="dashboard-premiere-heading">
        <PanelIcon icon={Timer} />
        {t('dashboard.premiere.title')}
      </h2>
      {lead ? (
        <>
          <ul className="artist-dash-premiere-list">
            {premieres.map((item) => (
              <li key={item.key}>
                <Link
                  params={{ releaseId: item.releaseId }}
                  to="/dashboard/music/$releaseId"
                >
                  {item.cover ? (
                    <img alt="" src={releaseCoverUrl(item.cover)} />
                  ) : (
                    <span className="artist-release-cover-placeholder">
                      <Music2 aria-hidden="true" />
                    </span>
                  )}
                  <span className="artist-dash-premiere-meta">
                    <span className="artist-release-row-title">
                      {item.title}
                    </span>
                    <time dateTime={item.at}>
                      {moment.format(new Date(item.at))}
                    </time>
                    <span
                      className="artist-dash-releases-status"
                      data-status={item.status}
                    >
                      {t(releaseStatusLabels[item.status])}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Countdown to={lead.at} />
        </>
      ) : (
        <p className="mt-3">{t('dashboard.premiere.empty')}</p>
      )}
    </section>
  )
}
