'use client'

import { FollowArtistButton } from '@entities/Artist'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { MoreHorizontal, Shuffle } from 'lucide-react'
import Image from 'next/image'
import { ArtistPlayButton } from '@/views/Artist/ui/ArtistPlayButton'

export type ArtistActionBarProps = {
  artistId: string
  artistName: string
  featuredCover?: string | null
  hasTracks: boolean
  isPlaying: boolean
  onShuffle: () => void
  onTogglePlay: () => void
}

/** Play / shuffle / follow row shown directly under the artist hero. */
export const ArtistActionBar = ({
  artistId,
  artistName,
  featuredCover,
  hasTracks,
  isPlaying,
  onShuffle,
  onTogglePlay,
}: ArtistActionBarProps) => (
  <div className="flex min-h-26 flex-wrap items-center gap-4 px-5 py-6 sm:px-6">
    <ArtistPlayButton
      artistName={artistName}
      disabled={!hasTracks}
      isPlaying={isPlaying}
      onClick={onTogglePlay}
    />

    {featuredCover ? (
      <button
        aria-label={`Play a popular track by ${artistName}`}
        className="relative hidden size-10 overflow-hidden rounded border border-white/35 shadow-md transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:block"
        disabled={!hasTracks}
        onClick={onTogglePlay}
        type="button"
      >
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="40px"
          src={getTrackCoverUrl(featuredCover)}
          unoptimized
        />
      </button>
    ) : null}

    <button
      aria-label={`Shuffle ${artistName}`}
      className="rounded-full p-2 text-text-subdued transition hover:scale-105 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      disabled={!hasTracks}
      onClick={onShuffle}
      type="button"
    >
      <Shuffle aria-hidden="true" size={27} />
    </button>

    <FollowArtistButton
      artistId={artistId}
      artistName={artistName}
      className="px-4 py-1.5"
      size="sm"
    />

    <button
      aria-label={`More options for ${artistName}`}
      className="rounded-full p-2 text-text-subdued transition hover:scale-105 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      type="button"
    >
      <MoreHorizontal aria-hidden="true" size={25} />
    </button>
  </div>
)
