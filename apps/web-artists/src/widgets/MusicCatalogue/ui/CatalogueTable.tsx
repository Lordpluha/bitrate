import { Button, cn } from '@bitrate/ui-react'
import {
  type MusicRelease,
  type MusicTrack,
  trackStatusLabels,
  trackVersionLabels,
} from '@entities/music'
import {
  releaseCoverUrl,
  releaseStatusLabels,
  releaseTypeLabels,
} from '@entities/release'
import { type Translate, useI18n } from '@shared/i18n'
import { formatDuration } from '@shared/lib/format'
import { Circle, Ellipsis, Music2, Pause, Play } from 'lucide-react'
import { canPreview } from '../model/usePreviewPlayer'

export type CatalogueItem = MusicTrack | MusicRelease

function catalogueDate(value: string, t: Translate, locale: string) {
  const date = new Date(value)
  const today = new Date()
  const day = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  )
  const elapsed = Math.floor(
    (day -
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())) /
      86_400_000,
  )
  if (elapsed === 0) return t('music.date.today')
  if (elapsed === 1) return t('music.date.yesterday')
  if (elapsed === 2) return t('music.date.twoDaysAgo')
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(date)
}

function catalogueStatus(item: CatalogueItem) {
  if ('version' in item) return trackStatusLabels[item.status]
  if (item.status === 'RELEASED') return 'labels.trackStatus.published'
  if (item.status === 'REJECTED') return 'labels.trackStatus.needsChanges'
  if (item.status === 'SUBMITTED') return 'labels.releaseStatus.inReview'
  return releaseStatusLabels[item.status]
}

export function CatalogueStatus({ item }: { item: CatalogueItem }) {
  const { t } = useI18n()
  return (
    <span className="artist-music-badge" data-status={item.status}>
      <Circle aria-hidden="true" className="size-3 shrink-0" />
      {t(catalogueStatus(item))}
    </span>
  )
}

export function trackDuration(seconds: number | null) {
  return seconds === null ? '—' : formatDuration(seconds)
}

interface CatalogueTableProps {
  tab: 'tracks' | 'releases'
  records: readonly CatalogueItem[]
  playingId?: string
  onPlay: (track: MusicTrack) => void
  onDetails: (item: CatalogueItem) => void
  onActions: (item: CatalogueItem) => void
}

export function CatalogueTable({
  tab,
  records,
  playingId,
  onPlay,
  onDetails,
  onActions,
}: CatalogueTableProps) {
  const { t, tp, locale } = useI18n()
  const date = (value: string) => catalogueDate(value, t, locale)
  return (
    <table className="artist-music-table" data-tab={tab}>
      <caption className="sr-only">
        {t(
          tab === 'tracks'
            ? 'music.table.yourTracks'
            : 'music.table.yourReleases',
        )}
      </caption>
      <thead className="sr-only @min-[900px]:not-sr-only">
        <tr>
          {tab === 'tracks' && (
            <th className="artist-music-play-cell">
              <span className="sr-only">{t('music.table.preview')}</span>
            </th>
          )}
          <th className="artist-music-title-cell" scope="col">
            {t(tab === 'tracks' ? 'music.table.track' : 'music.table.release')}
          </th>
          <th scope="col">
            {t(
              tab === 'tracks'
                ? 'music.table.versionDuration'
                : 'music.table.type',
            )}
          </th>
          <th scope="col">{t('music.table.status')}</th>
          <th scope="col">
            {t(tab === 'tracks' ? 'music.table.updated' : 'music.table.tracks')}
          </th>
          <th scope="col">
            {t(
              tab === 'tracks'
                ? 'music.table.release'
                : 'music.table.releaseDate',
            )}
          </th>
          {tab === 'releases' && (
            <th scope="col">{t('music.table.updated')}</th>
          )}
          <th className="artist-music-actions-cell">
            <span className="sr-only">{t('music.table.actions')}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {records.map((item) => {
          const isTrack = 'version' in item
          const playing = playingId === item.id
          return (
            <tr
              className={cn(playing && 'artist-music-row-playing')}
              key={item.id}
            >
              {isTrack && (
                <td className="artist-music-play-cell">
                  <Button
                    aria-label={t(
                      playing ? 'music.table.pause' : 'music.table.play',
                      { title: item.title },
                    )}
                    aria-pressed={playing}
                    disabled={!canPreview(item)}
                    onClick={() => onPlay(item)}
                    size="icon"
                    title={
                      item.previewUrl
                        ? item.isDemo
                          ? t('music.table.playSample')
                          : t('music.table.playPreview')
                        : item.release
                          ? t('music.table.playMaster')
                          : t('music.table.noPreview')
                    }
                    variant="ghost"
                  >
                    {playing ? (
                      <Pause aria-hidden="true" className="size-4" />
                    ) : (
                      <Play aria-hidden="true" className="size-4" />
                    )}
                  </Button>
                </td>
              )}
              <td className="artist-music-title-cell">
                <button
                  aria-label={t('music.table.open', { title: item.title })}
                  className="artist-music-record"
                  onClick={() => onDetails(item)}
                  type="button"
                >
                  {item.cover ? (
                    <img
                      alt=""
                      className="artist-music-cover"
                      height={44}
                      loading="lazy"
                      src={releaseCoverUrl(item.cover)}
                      width={44}
                    />
                  ) : (
                    <span className="artist-music-cover flex items-center justify-center bg-secondary">
                      <Music2
                        aria-hidden="true"
                        className="size-5 text-text-secondary"
                      />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="artist-music-record-title block font-semibold">
                      {item.title}
                    </span>
                    <span className="artist-music-record-artist mt-1 block text-xs text-text-secondary">
                      {item.artistName}
                    </span>
                  </span>
                </button>
              </td>
              <td className="artist-music-version-cell">
                {isTrack
                  ? `${t(trackVersionLabels[item.version])} · ${trackDuration(item.duration)}`
                  : t(releaseTypeLabels[item.type])}
              </td>
              <td className="artist-music-status-cell">
                <CatalogueStatus item={item} />
              </td>
              <td className="artist-music-updated-cell">
                {isTrack ? (
                  <time dateTime={item.updatedAt}>{date(item.updatedAt)}</time>
                ) : (
                  tp({ count: item.trackCount, key: 'common.tracks' })
                )}
              </td>
              <td className="artist-music-release-cell">
                {isTrack
                  ? (item.release?.title ?? t('music.table.unreleased'))
                  : item.scheduledAt
                    ? date(item.scheduledAt)
                    : t('music.table.notScheduled')}
              </td>
              {!isTrack && (
                <td className="artist-music-release-updated">
                  <time dateTime={item.updatedAt}>{date(item.updatedAt)}</time>
                </td>
              )}
              <td className="artist-music-actions-cell">
                <Button
                  aria-label={t('music.item.actionsFor', { title: item.title })}
                  onClick={() => onActions(item)}
                  size="icon"
                  variant="ghost"
                >
                  <Ellipsis aria-hidden="true" className="size-4" />
                </Button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
