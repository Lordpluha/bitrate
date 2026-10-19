'use client'

import { ArtistName } from '@entities/Artist'
import { MediaImage } from '@shared/ui/MediaImage'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import type { SearchTrackResult } from '@/features/Search/api/client'

/** How many songs sit beside the top result, as in the design. */
const SONGS_BESIDE_TOP_RESULT = 4

type SearchSongsProps = {
  onPlay?: (track: SearchTrackResult) => void
  tracks: SearchTrackResult[]
}

/** The design's Songs column: ranked Chart Rows that play the song when chosen. */
export const SearchSongs = ({ onPlay, tracks }: SearchSongsProps) => (
  <section className="flex min-w-0 flex-col gap-3">
    <h2 className="text-[19px] leading-[1.25] font-semibold">Songs</h2>
    <ol className="flex flex-col">
      {tracks.slice(0, SONGS_BESIDE_TOP_RESULT).map((track, index) => (
        <li key={track.id}>
          <button
            aria-label={`Play ${track.title}`}
            className="group flex h-15 w-full items-center gap-4 rounded-lg px-3 text-left transition-colors hover:bg-surface disabled:cursor-default"
            disabled={!onPlay}
            onClick={() => onPlay?.(track)}
            type="button"
          >
            <span className="w-8 shrink-0 font-[family-name:var(--font-landing-display)] text-xl font-bold text-muted-foreground group-hover:text-foreground">
              {index + 1}
            </span>
            <MediaImage
              alt=""
              className="size-11 shrink-0 rounded-md object-cover"
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
                {track.artistName ?? <ArtistName artistId={track.artistId} />}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  </section>
)
