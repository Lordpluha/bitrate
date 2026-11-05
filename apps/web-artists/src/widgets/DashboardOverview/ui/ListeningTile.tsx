import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { PanelIcon } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight, AudioLines } from 'lucide-react'

/** Never shows zeroes for data Bitrate does not have yet. */
export function ListeningTile() {
  const { t } = useI18n()
  return (
    <section
      aria-labelledby="dashboard-analytics-heading"
      className="artist-release-workspace-panel artist-dash-listening"
    >
      <img
        alt=""
        aria-hidden="true"
        className="artist-dash-art"
        src="/artwork/dashboard/listening-spectrum.webp"
      />
      <h2 id="dashboard-analytics-heading">
        <PanelIcon icon={AudioLines} />
        {t('dashboard.listening.title')}
      </h2>
      <p>{t('dashboard.listening.period')}</p>
      <p className="artist-dash-listening-note">
        {t('dashboard.listening.note')}
      </p>
      <Link
        className="artist-dash-link"
        search={{ days: 28 }}
        to={ROUTES.dashboard.analytics}
      >
        {t('dashboard.listening.open')}
        <ArrowUpRight aria-hidden="true" className="size-4" />
      </Link>
    </section>
  )
}
