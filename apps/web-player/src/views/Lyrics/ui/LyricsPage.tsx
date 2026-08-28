'use client'

import { ArtistLink } from '@entities/Artist'
import { selectCurrentTrack, usePlayerStore } from '@entities/Player'
import { ROUTES } from '@shared/routes'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { Mic2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const LyricsPage = () => {
  const currentTrack = usePlayerStore(selectCurrentTrack)

  if (!currentTrack) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg bg-background-secondary px-6 text-center">
        <Mic2 className="text-text-subdued" size={40} />
        <h1 className="text-2xl font-bold text-text sm:text-3xl">
          Nothing is playing
        </h1>
        <p className="max-w-100 text-text-subdued">
          Start a track and its lyrics will appear here.
        </p>
        <Link
          className="mt-2 rounded-full bg-text px-6 py-3 text-sm font-bold text-background transition-transform hover:scale-105"
          href={ROUTES.main}
        >
          Find something to play
        </Link>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto rounded-lg bg-background-secondary custom-scrollbar">
      <div className="mx-auto w-full max-w-200 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-8 flex items-center gap-4">
          <Image
            alt={currentTrack.title}
            className="size-16 rounded object-cover shadow-lg sm:size-20"
            height={80}
            src={getTrackCoverUrl(currentTrack.cover)}
            unoptimized
            width={80}
          />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-black text-text sm:text-3xl">
              {currentTrack.title}
            </h1>
            <p className="truncate text-sm text-text-subdued">
              <ArtistLink artistId={currentTrack.artistId} />
            </p>
          </div>
        </header>

        {currentTrack.lyrics ? (
          <p className="whitespace-pre-line text-lg font-semibold leading-9 text-text sm:text-2xl sm:leading-10">
            {currentTrack.lyrics}
          </p>
        ) : (
          <div className="rounded-xl bg-surface px-6 py-14 text-center">
            <Mic2 className="mx-auto mb-3 text-text-subdued" size={36} />
            <h2 className="text-xl font-bold text-text">
              No lyrics for this track
            </h2>
            <p className="mx-auto mt-2 max-w-100 text-sm text-text-subdued">
              Lyrics haven&apos;t been added to this track yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
