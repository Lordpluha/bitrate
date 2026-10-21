'use client'

import { cn } from '@bitrate/ui-react'
import { ArtistName } from '@entities/Artist'
import {
  type DiscoveryRange,
  type ListeningStat,
  summarizeListening,
  useTopArtists,
  useTopTracks,
} from '@entities/Discovery'
import { ROUTES } from '@shared/routes'
import { PageTitle, Skeleton, StateMessage } from '@shared/ui'
import { MediaImage } from '@shared/ui/MediaImage'
import { getArtistAvatarUrl, getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { ChartColumn, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { type ReactNode, useState } from 'react'
import { usePlayCollection } from '@/features/PlayCollection'

const RANGES: ReadonlyArray<{ id: DiscoveryRange; label: string }> = [
  { id: 'short', label: 'Last 4 weeks' },
  { id: 'medium', label: 'Last 6 months' },
  { id: 'long', label: 'All time' },
]

const TOP_TRACKS = 10
const TOP_ARTISTS = 8
const TILE_KEYS = ['tracks', 'artists', 'top-artist', 'top-track']

const plays = (count: number) =>
  `${count.toLocaleString('en-US')} ${count === 1 ? 'play' : 'plays'}`

/** The design's Stat Tile. */
const StatTile = ({ label, sub, value }: ListeningStat) => (
  <div className="flex min-w-0 flex-col gap-1.5 rounded-[14px] border border-border bg-card p-4 md:p-5">
    <span className="truncate text-[13px] text-muted-foreground">{label}</span>
    <span className="truncate font-[family-name:var(--font-landing-display)] text-xl font-bold text-foreground sm:text-2xl md:text-[28px]">
      {value}
    </span>
    <span className="truncate text-[13px] text-muted-foreground">{sub}</span>
  </div>
)

/** The design's Panel: a titled card holding a list. */
const Panel = ({ children, title }: { children: ReactNode; title: string }) => (
  <section className="flex min-w-0 flex-col gap-3 rounded-[14px] border border-border bg-card p-4 md:p-6">
    <h2 className="font-[family-name:var(--font-landing-body)] text-base font-semibold text-foreground">
      {title}
    </h2>
    {children}
  </section>
)

const StatsLoading = () => (
  <div
    aria-label="Loading statistics"
    className="flex flex-col gap-4"
    role="status"
  >
    <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
      {TILE_KEYS.map((key) => (
        <Skeleton className="h-28 rounded-[14px]" key={key} />
      ))}
    </div>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <Skeleton className="h-96 rounded-[14px]" />
      <Skeleton className="h-96 rounded-[14px]" />
    </div>
  </div>
)

const StatsContent = ({ range }: { range: DiscoveryRange }) => {
  const tracks = useTopTracks(range, 1, TOP_TRACKS)
  const artists = useTopArtists(range, 1, TOP_ARTISTS)
  const playCollection = usePlayCollection()

  if (tracks.isPending || artists.isPending) return <StatsLoading />
  if (tracks.isError || artists.isError) {
    return (
      <StateMessage
        description="Try again in a moment."
        icon={TriangleAlert}
        primary={{
          label: 'Try again',
          onClick: () => {
            void tracks.refetch()
            void artists.refetch()
          },
        }}
        title="Statistics are unavailable"
        tone="error"
      />
    )
  }

  const stats = summarizeListening({
    artists: artists.data,
    tracks: tracks.data,
  })
  if (!stats) {
    return (
      <StateMessage
        description="Listen for a few days and your statistics will appear here."
        icon={ChartColumn}
        primary={{ href: ROUTES.main, label: 'Find something to play' }}
        title="Not enough listening yet"
      />
    )
  }

  const isSwitchingRange = tracks.isPlaceholderData || artists.isPlaceholderData

  return (
    <div
      aria-busy={isSwitchingRange}
      className={cn(
        'flex flex-col gap-4 transition-opacity',
        isSwitchingRange && 'opacity-60',
      )}
    >
      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatTile key={stat.label} {...stat} />
        ))}
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title="Top tracks">
          <ol className="-mx-2 flex flex-col">
            {tracks.data.data.map((track, index) => (
              <li key={track.id}>
                <button
                  aria-label={`Play ${track.title}`}
                  className="grid h-14 w-full grid-cols-[24px_40px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 text-left transition-colors hover:bg-surface"
                  onClick={() =>
                    void playCollection({
                      id: track.id,
                      kind: 'track',
                      title: track.title,
                    })
                  }
                  type="button"
                >
                  <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                    {index + 1}
                  </span>
                  <MediaImage
                    alt=""
                    className="size-10 rounded-md object-cover"
                    fallback="track"
                    height={40}
                    src={getTrackCoverUrl(track.cover)}
                    unoptimized
                    width={40}
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {track.title}
                    </span>
                    <span className="truncate text-[13px] text-muted-foreground">
                      {track.artist?.username ?? (
                        <ArtistName artistId={track.artistId} />
                      )}
                    </span>
                  </span>
                  <span className="text-[13px] text-muted-foreground tabular-nums">
                    {plays(track.plays)}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="Top artists">
          <ol className="-mx-2 flex flex-col">
            {artists.data.data.map((artist) => (
              <li key={artist.id}>
                <Link
                  className="flex h-14 items-center gap-3 rounded-lg px-2 transition-colors hover:bg-surface"
                  href={ROUTES.artist(artist.id)}
                >
                  <MediaImage
                    alt=""
                    className="size-10 shrink-0 rounded-full object-cover"
                    fallback="artist"
                    height={40}
                    src={getArtistAvatarUrl(artist.avatar)}
                    unoptimized
                    width={40}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                    {artist.username}
                  </span>
                  <span className="text-[13px] text-muted-foreground tabular-nums">
                    {plays(artist.plays)}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </div>
  )
}

/**
 * Listening analytics: the stat tiles and top lists for a window. Minutes, streaks and
 * listening by day wait for an endpoint, so the tiles show only what the top lists back.
 */
export const StatsPage = () => {
  const [range, setRange] = useState<DiscoveryRange>('short')

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-5 px-4 pt-2 pb-3 md:gap-6 md:px-8 md:py-6">
        <div className="flex flex-col gap-1.5">
          <PageTitle title="Your listening" />
          <p className="text-sm text-muted-foreground">Only visible to you.</p>
        </div>
        <div
          aria-label="Time range"
          className="-mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0"
          role="tablist"
        >
          {RANGES.map(({ id, label }) => (
            <button
              aria-selected={range === id}
              className={cn(
                'h-9 shrink-0 rounded-md px-3 text-sm font-medium transition-colors',
                range === id
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-surface hover:text-foreground',
              )}
              key={id}
              onClick={() => setRange(id)}
              role="tab"
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <StatsContent range={range} />
      </div>
    </div>
  )
}
