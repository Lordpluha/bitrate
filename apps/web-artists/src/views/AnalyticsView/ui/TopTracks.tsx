import type { ArtistAnalytics } from '@entities/analytics'
import { trackCoverUrl } from '@entities/release'
import { useI18n } from '@shared/i18n'
import { useArtworkAmbience } from '@shared/lib/artworkAmbience'
import { PanelIcon } from '@shared/ui'
import { Music2, Trophy } from 'lucide-react'
import { useFormats } from '../lib/useFormats'

/** Ranked tracks with their artwork; the leader's colours tint the tile and the page behind it. */
export function TopTracks({ data }: { data: ArtistAnalytics }) {
  const { t } = useI18n()
  const format = useFormats()
  const most = Math.max(1, ...data.topTracks.map((track) => track.plays))
  const leaderCover = data.topTracks[0]?.cover
  useArtworkAmbience(leaderCover ? trackCoverUrl(leaderCover) : null)
  return (
    <section
      aria-labelledby="analytics-top-heading"
      className="artist-release-workspace-panel artist-analytics-top-tile"
    >
      {leaderCover && (
        <span aria-hidden="true" className="artist-cover-wash">
          <img alt="" src={trackCoverUrl(leaderCover)} />
        </span>
      )}
      <h2 id="analytics-top-heading">
        <PanelIcon icon={Trophy} />
        {t('analytics.top')}
      </h2>
      {data.topTracks.length === 0 ? (
        <p className="mt-3 text-sm text-text-secondary">
          {t('analytics.noPlaysPeriod')}
        </p>
      ) : (
        <table className="artist-analytics-top">
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">#</span>
              </th>
              <th scope="col">{t('music.table.track')}</th>
              <th scope="col">{t('analytics.plays')}</th>
              <th scope="col">{t('analytics.listeners')}</th>
            </tr>
          </thead>
          <tbody>
            {data.topTracks.map((track, index) => (
              <tr key={track.trackId}>
                <td className="artist-analytics-rank">{index + 1}</td>
                <td className="min-w-0">
                  <span className="artist-analytics-track">
                    {track.cover ? (
                      <img alt="" src={trackCoverUrl(track.cover)} />
                    ) : (
                      <span className="artist-release-cover-placeholder">
                        <Music2 aria-hidden="true" />
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate">{track.title}</span>
                      <span aria-hidden="true" className="artist-analytics-bar">
                        <span
                          style={{ width: `${(track.plays / most) * 100}%` }}
                        />
                      </span>
                    </span>
                  </span>
                </td>
                <td className="tabular-nums">{format.number(track.plays)}</td>
                <td className="tabular-nums text-text-secondary">
                  {format.number(track.listeners)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
