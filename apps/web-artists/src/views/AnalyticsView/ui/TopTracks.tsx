import { Button } from '@bitrate/ui-react'
import { type ArtistAnalytics, useTopTracks } from '@entities/analytics'
import { trackCoverUrl } from '@entities/release'
import { useI18n } from '@shared/i18n'
import { useArtworkAmbience } from '@shared/lib/artworkAmbience'
import { PageSkeleton, Pagination, PanelIcon } from '@shared/ui'
import { Music2, Trophy } from 'lucide-react'
import { useState } from 'react'
import { useFormats } from '../lib/useFormats'

/** Ranked tracks with their artwork; the leader's colours tint the tile and the page behind it. */
export function TopTracks({
  artistId,
  data,
}: {
  artistId: string
  data: ArtistAnalytics
}) {
  const { t, tMessage } = useI18n()
  const format = useFormats()
  const days = data.period.days
  // The page belongs to the period it was picked in; another period starts again at its first.
  const [paging, setPaging] = useState({ days, page: 1 })
  const page = paging.days === days ? paging.page : 1
  const setPage = (next: number) => setPaging({ days, page: next })
  const tracks = useTopTracks(artistId, days, page)
  const result = tracks.data
  const most = Math.max(1, result?.maxPlays ?? 0)
  const pages = Math.max(
    1,
    Math.ceil((result?.total ?? 0) / (result?.limit ?? 5)),
  )
  const leaderCover = data.topTracks[0]?.cover
  useArtworkAmbience(leaderCover ? trackCoverUrl(leaderCover) : null)
  return (
    <section
      aria-busy={tracks.isFetching}
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
      {tracks.isPending || tracks.isPlaceholderData ? (
        <PageSkeleton
          className="mt-3"
          label={t('analytics.loading')}
          variant="table"
        />
      ) : tracks.isError ? (
        <div className="mt-3 space-y-3">
          <p role="alert">{tMessage(tracks.error.message)}</p>
          <Button
            onClick={() => void tracks.refetch()}
            size="sm"
            variant="outline"
          >
            {t('common.tryAgain')}
          </Button>
        </div>
      ) : !result || result.data.length === 0 ? (
        <p className="mt-3 text-sm text-text-secondary">
          {t('analytics.noPlaysPeriod')}
        </p>
      ) : (
        <section
          aria-label={t('analytics.top')}
          className="artist-analytics-table-scroll"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users must be able to scroll the table.
          tabIndex={0}
        >
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
              {result.data.map((track, index) => (
                <tr key={track.trackId}>
                  <td className="artist-analytics-rank">
                    {(result.page - 1) * result.limit + index + 1}
                  </td>
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
                        <span
                          aria-hidden="true"
                          className="artist-analytics-bar"
                        >
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
        </section>
      )}
      {result && !tracks.isError && pages > 1 && (
        <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <p aria-live="polite" className="text-xs text-text-secondary">
            {t('music.pagination.range', {
              from: (result.page - 1) * result.limit + 1,
              to: Math.min(result.page * result.limit, result.total),
              total: result.total,
            })}
          </p>
          <Pagination
            disabled={tracks.isFetching}
            label={t('analytics.topPages')}
            onPage={setPage}
            page={result.page}
            pages={pages}
          />
        </footer>
      )}
    </section>
  )
}
