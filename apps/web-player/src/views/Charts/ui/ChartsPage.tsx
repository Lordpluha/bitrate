'use client'

import { ArtistName } from '@entities/Artist'
import { useArtistCharts, useCharts } from '@entities/Discovery'
import { ROUTES } from '@shared/routes'
import {
  ErrorState,
  PageTitle,
  type SegmentedTab,
  SegmentedTabs,
  StateMessage,
  TrackRowSkeleton,
} from '@shared/ui'
import { MediaImage } from '@shared/ui/MediaImage'
import { formatDuration } from '@shared/utils/apiHelpers'
import { getArtistAvatarUrl, getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { usePlayCollection } from '@/features/PlayCollection'

type ChartTab = 'artists' | 'rising' | 'songs'

const TABS: ReadonlyArray<SegmentedTab<ChartTab>> = [
  { id: 'songs', label: 'Top songs' },
  { id: 'artists', label: 'Top artists' },
  { id: 'rising', label: 'Rising' },
]

/** How many places each chart lists. */
const CHART_LENGTH = 50
const SKELETON_KEYS = Array.from({ length: 8 }, (_, row) => `chart-row-${row}`)

const rowClassName =
  'grid h-15 w-full grid-cols-[32px_44px_minmax(0,1fr)_auto] items-center gap-4 rounded-lg px-3 text-left transition-colors hover:bg-surface'

const Rank = ({ place }: { place: number }) => (
  <span className="font-[family-name:var(--font-landing-display)] text-xl font-bold text-muted-foreground">
    {place}
  </span>
)

const ChartError = ({ onRetry }: { onRetry: () => void }) => (
  <ErrorState
    description="Try again in a moment."
    onRetry={onRetry}
    title="Charts are unavailable"
  />
)

const ChartLoading = () => (
  <div aria-label="Loading chart" className="flex flex-col gap-1" role="status">
    {SKELETON_KEYS.map((key) => (
      <TrackRowSkeleton key={key} />
    ))}
  </div>
)

const SongsChart = ({ scope }: { scope: 'global' | 'viral' }) => {
  const chart = useCharts({ limit: CHART_LENGTH, scope })
  const playCollection = usePlayCollection()

  if (chart.isPending) return <ChartLoading />
  if (chart.isError) return <ChartError onRetry={() => void chart.refetch()} />
  if (chart.data.data.length === 0) {
    return (
      <StateMessage
        description="Charts fill in as people listen."
        icon={TrendingUp}
        title="Nothing is charting yet"
      />
    )
  }

  return (
    <ol className="flex flex-col">
      {chart.data.data.map((track, index) => (
        <li key={track.id}>
          <button
            aria-label={`Play ${track.title}`}
            className={rowClassName}
            onClick={() =>
              void playCollection({
                id: track.id,
                kind: 'track',
                title: track.title,
              })
            }
            type="button"
          >
            <Rank place={index + 1} />
            <MediaImage
              alt=""
              className="size-11 rounded-md object-cover"
              fallback="track"
              height={44}
              src={getTrackCoverUrl(track.cover)}
              unoptimized
              width={44}
            />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-sm font-semibold text-foreground">
                {track.title}
              </span>
              <span className="truncate text-[13px] text-muted-foreground">
                {track.artist?.username ?? (
                  <ArtistName artistId={track.artistId} />
                )}
              </span>
            </span>
            <span className="text-[13px] tabular-nums text-muted-foreground">
              {formatDuration(track.duration ?? 0)}
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

const ArtistsChart = () => {
  const chart = useArtistCharts({ limit: CHART_LENGTH })

  if (chart.isPending) return <ChartLoading />
  if (chart.isError) return <ChartError onRetry={() => void chart.refetch()} />
  if (chart.data.data.length === 0) {
    return (
      <StateMessage
        description="Charts fill in as people listen."
        icon={TrendingUp}
        title="Nothing is charting yet"
      />
    )
  }

  return (
    <ol className="flex flex-col">
      {chart.data.data.map((artist, index) => (
        <li key={artist.id}>
          <Link className={rowClassName} href={ROUTES.artist(artist.id)}>
            <Rank place={index + 1} />
            <MediaImage
              alt=""
              className="size-11 rounded-full object-cover"
              fallback="artist"
              height={44}
              src={getArtistAvatarUrl(artist.avatar)}
              unoptimized
              width={44}
            />
            <span className="truncate text-sm font-semibold text-foreground">
              {artist.username}
            </span>
            <span className="text-[13px] tabular-nums text-muted-foreground">
              {artist.listeners.toLocaleString('en-US')}{' '}
              {artist.listeners === 1 ? 'listener' : 'listeners'}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )
}

/** Trending & charts: the most played songs, the most listened artists and what is rising. */
export const ChartsPage = () => {
  const [tab, setTab] = useState<ChartTab>('songs')

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-5 px-4 pt-2 pb-3 md:gap-7 md:px-8 md:py-6">
        <PageTitle title="Trending & charts" />
        <SegmentedTabs
          ariaLabel="Charts"
          className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0"
          onChange={setTab}
          tabs={TABS}
          value={tab}
        />
        {tab === 'artists' ? (
          <ArtistsChart />
        ) : (
          <SongsChart scope={tab === 'rising' ? 'viral' : 'global'} />
        )}
      </div>
    </div>
  )
}
