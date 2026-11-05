import type { ArtistDashboard } from '@entities/dashboard'
import { useMusicCatalogue } from '@entities/music'
import { releaseCoverUrl } from '@entities/release'
import { useI18n } from '@shared/i18n'
import { CountUp, PanelIcon } from '@shared/ui'
import { Hash } from 'lucide-react'
import { catalogueShare } from '../lib/catalogueShare'

const FAN_COVERS = 5

interface NumbersTileProps {
  artistId: string
  counts: ArtistDashboard['counts']
}

/** The catalogue at a glance: its size, where the releases stand and a fan of their covers. */
export function NumbersTile({ artistId, counts }: NumbersTileProps) {
  const { t } = useI18n()
  // The same query as the releases tile, so the two share one request.
  const releases = useMusicCatalogue(artistId, 'releases', {
    page: 1,
    sort: 'updated',
  })
  const rows =
    releases.data && 'data' in releases.data ? releases.data.data : []
  const covers = [
    ...new Set(rows.flatMap((row) => (row.cover ? [row.cover] : []))),
  ].slice(0, FAN_COVERS)
  const shares = catalogueShare(counts)
  return (
    <section
      aria-labelledby="dashboard-numbers-heading"
      className="artist-release-workspace-panel artist-dash-catalogue"
    >
      <div className="artist-dash-catalogue-main">
        <h2 id="dashboard-numbers-heading">
          <PanelIcon icon={Hash} />
          {t('dashboard.numbers.title')}
        </h2>
        <dl className="artist-dash-numbers">
          <div>
            <dt>{t('dashboard.numbers.releases')}</dt>
            <dd>
              <CountUp value={counts.releases} />
            </dd>
          </div>
          <div>
            <dt>{t('dashboard.numbers.tracks')}</dt>
            <dd>
              <CountUp value={counts.tracks} />
            </dd>
          </div>
        </dl>
        {shares.length > 0 && (
          <div className="artist-dash-share">
            <div aria-hidden="true" className="artist-dash-share-bar">
              {shares.map((share) => (
                <span
                  data-share={share.key}
                  key={share.key}
                  style={{ flexGrow: share.count }}
                />
              ))}
            </div>
            <ul className="artist-dash-share-legend">
              {shares.map((share) => (
                <li data-share={share.key} key={share.key}>
                  {t(share.label)} <b>{share.count}</b>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {covers.length > 0 && (
        <div aria-hidden="true" className="artist-dash-fan">
          {covers.map((cover) => (
            <img alt="" key={cover} src={releaseCoverUrl(cover)} />
          ))}
        </div>
      )}
    </section>
  )
}
