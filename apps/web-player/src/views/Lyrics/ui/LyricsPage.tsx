'use client'

import { ArtistLink } from '@entities/Artist'
import { selectCurrentTrack, usePlayerStore } from '@entities/Player'
import { ROUTES } from '@shared/routes'
import { StateMessage } from '@shared/ui'
import { MediaImage } from '@shared/ui/MediaImage'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { MicVocal } from 'lucide-react'

/**
 * The playing track's lyrics in the design's lyric style: the track beside a 56px cover, then
 * the lines in 34px Unbounded. Lyrics carry no timings yet, so no line is marked current.
 */
export const LyricsPage = () => {
  const currentTrack = usePlayerStore(selectCurrentTrack)

  if (!currentTrack) {
    return (
      <div className="flex h-full flex-1 flex-col px-4 md:px-8">
        <StateMessage
          description="Start a track and its lyrics will appear here."
          icon={MicVocal}
          primary={{ href: ROUTES.search(), label: 'Find something to play' }}
          title="Nothing is playing"
        />
      </div>
    )
  }

  /* repeated choruses repeat their text, so each line is keyed by where it sits in the song */
  const lines = currentTrack.lyrics
    ?.split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text, position) => ({ key: `line-${position}`, text }))

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto custom-scrollbar">
      <div className="flex flex-1 flex-col gap-7 px-4 pt-2 pb-3 md:px-8 md:py-6">
        <header className="flex items-center gap-3.5">
          <MediaImage
            alt=""
            className="size-12 rounded-md object-cover md:size-14"
            fallback="track"
            height={56}
            src={getTrackCoverUrl(currentTrack.cover)}
            unoptimized
            width={56}
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="truncate font-[family-name:var(--font-landing-body)] text-sm font-semibold text-foreground">
              {currentTrack.title}
            </h1>
            <p className="truncate text-[13px] text-accent">
              <ArtistLink artistId={currentTrack.artistId} />
            </p>
          </div>
        </header>

        {lines && lines.length > 0 ? (
          <div className="flex max-w-180 flex-col gap-3.5">
            {lines.map(({ key, text }) => (
              <p
                className="font-[family-name:var(--font-landing-display)] text-2xl leading-[1.25] font-bold text-foreground md:text-[34px]"
                key={key}
              >
                {text}
              </p>
            ))}
          </div>
        ) : (
          <StateMessage
            description="Lyrics haven't been added to this track yet."
            icon={MicVocal}
            title="No lyrics for this track"
          />
        )}
      </div>
    </div>
  )
}
