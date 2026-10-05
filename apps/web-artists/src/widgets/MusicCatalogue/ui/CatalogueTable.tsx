import { Button, cn } from '@bitrate/ui-react'
import {
  type MusicRelease,
  type MusicTrack,
  trackStatusLabels,
  trackVersionLabels,
} from '@entities/music'
import { releaseStatusLabels, releaseTypeLabels } from '@entities/release'
import { Circle, Ellipsis, Music2, Pause, Play } from 'lucide-react'

export type CatalogueItem = MusicTrack | MusicRelease

export function catalogueDate(value: string) {
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
  if (elapsed === 0) return 'Today'
  if (elapsed === 1) return 'Yesterday'
  if (elapsed === 2) return '2 days ago'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(date)
}

export function catalogueStatus(item: CatalogueItem) {
  if ('version' in item) return trackStatusLabels[item.status]
  if (item.status === 'RELEASED') return 'Published'
  if (item.status === 'REJECTED') return 'Needs changes'
  if (item.status === 'SUBMITTED') return 'In review'
  return releaseStatusLabels[item.status]
}

export function CatalogueStatus({ item }: { item: CatalogueItem }) {
  return (
    <span className="artist-music-badge" data-status={item.status}>
      <Circle aria-hidden="true" className="size-3 shrink-0" />
      {catalogueStatus(item)}
    </span>
  )
}

export function trackDuration(seconds: number | null) {
  return seconds === null
    ? '—'
    : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
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
  return (
    <table className="artist-music-table" data-tab={tab}>
      <caption className="sr-only">Your {tab}</caption>
      <thead>
        <tr>
          {tab === 'tracks' && (
            <th className="artist-music-play-cell">
              <span className="sr-only">Preview</span>
            </th>
          )}
          <th className="artist-music-title-cell" scope="col">
            {tab === 'tracks' ? 'Track' : 'Release'}
          </th>
          <th scope="col">
            {tab === 'tracks' ? 'Version · duration' : 'Type'}
          </th>
          <th scope="col">Status</th>
          <th scope="col">{tab === 'tracks' ? 'Updated' : 'Tracks'}</th>
          <th scope="col">{tab === 'tracks' ? 'Release' : 'Release date'}</th>
          {tab === 'releases' && <th scope="col">Updated</th>}
          <th className="artist-music-actions-cell">
            <span className="sr-only">Actions</span>
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
                    aria-label={`${playing ? 'Pause' : 'Play'} ${item.title}`}
                    aria-pressed={playing}
                    disabled={!item.previewUrl}
                    onClick={() => onPlay(item)}
                    size="icon"
                    title={
                      item.previewUrl
                        ? item.isDemo
                          ? 'Play illustrative sample audio'
                          : 'Play preview'
                        : 'No preview available'
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
                  aria-label={`Open ${item.title}`}
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
                      src={item.cover}
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
                  ? `${trackVersionLabels[item.version]} · ${trackDuration(item.duration)}`
                  : releaseTypeLabels[item.type]}
              </td>
              <td className="artist-music-status-cell">
                <CatalogueStatus item={item} />
              </td>
              <td className="artist-music-updated-cell">
                {isTrack ? (
                  <time dateTime={item.updatedAt}>
                    {catalogueDate(item.updatedAt)}
                  </time>
                ) : (
                  item.trackCount
                )}
              </td>
              <td className="artist-music-release-cell">
                {isTrack
                  ? (item.release?.title ?? 'Unreleased')
                  : item.scheduledAt
                    ? catalogueDate(item.scheduledAt)
                    : 'Not scheduled'}
              </td>
              {!isTrack && (
                <td className="artist-music-release-updated">
                  <time dateTime={item.updatedAt}>
                    {catalogueDate(item.updatedAt)}
                  </time>
                </td>
              )}
              <td className="artist-music-actions-cell">
                <Button
                  aria-label={`Actions for ${item.title}`}
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
