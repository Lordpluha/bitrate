import { useMusicCatalogue } from '@entities/music'
import { notificationTime } from '@entities/notification'
import {
  releaseCoverUrl,
  releaseStatusLabels,
  releaseTypeLabels,
} from '@entities/release'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { PanelIcon } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import { ChevronRight, Library, Music2 } from 'lucide-react'

/** The three most recently changed releases, with a way into the catalogue. */
export function ReleasesTile({ artistId }: { artistId: string }) {
  const i18n = useI18n()
  const { t, tp } = i18n
  const releases = useMusicCatalogue(artistId, 'releases', {
    page: 1,
    sort: 'updated',
  })
  const rows =
    releases.data && 'data' in releases.data
      ? releases.data.data.filter((item) => 'trackCount' in item).slice(0, 3)
      : []
  return (
    <section
      aria-labelledby="dashboard-releases-heading"
      className="artist-release-workspace-panel"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="dashboard-releases-heading">
          <PanelIcon icon={Library} />
          {t('music.table.yourReleases')}
        </h2>
        <Link
          className="artist-dash-link"
          search={{ tab: 'releases', page: 1 }}
          to={ROUTES.dashboard.music}
        >
          {t('dashboard.releases.viewMusic')}
        </Link>
      </div>
      {releases.isPending ? (
        <p className="mt-3" role="status">
          {t('dashboard.releases.loading')}
        </p>
      ) : releases.isError ? (
        <p className="mt-3" role="alert">
          {t('dashboard.releases.unavailable')}
        </p>
      ) : (
        <ul className="artist-dash-releases">
          {rows.map((release) => (
            <li key={release.id}>
              <Link
                params={{ releaseId: release.id }}
                to="/dashboard/music/$releaseId"
              >
                {release.cover ? (
                  <img alt="" src={releaseCoverUrl(release.cover)} />
                ) : (
                  <span className="artist-release-cover-placeholder">
                    <Music2 aria-hidden="true" />
                  </span>
                )}
                <span className="artist-dash-releases-meta">
                  <span className="artist-release-row-title">
                    {release.title}
                  </span>
                  <span>
                    {t(releaseTypeLabels[release.type])}
                    {` · ${tp({ count: release.trackCount, key: 'common.tracks' })}`}
                  </span>
                </span>
                <span
                  className="artist-dash-releases-status"
                  data-status={release.status}
                >
                  {t(releaseStatusLabels[release.status])}
                </span>
                <time
                  className="artist-dash-releases-updated"
                  dateTime={release.updatedAt}
                >
                  {notificationTime(release.updatedAt, i18n)}
                </time>
                <ChevronRight aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
