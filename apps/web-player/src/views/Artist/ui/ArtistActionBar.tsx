'use client'

import { FollowArtistButton } from '@entities/Artist'
import { Shuffle } from 'lucide-react'
import { ArtistMoreMenu } from '@/views/Artist/ui/ArtistMoreMenu'
import { ArtistPlayButton } from '@/views/Artist/ui/ArtistPlayButton'

export type ArtistActionBarProps = {
  artistId: string
  artistName: string
  hasTracks: boolean
  isPlaying: boolean
  onShuffle: () => void
  onTogglePlay: () => void
}

/** Play / shuffle / follow row shown directly under the artist hero. */
export const ArtistActionBar = ({
  artistId,
  artistName,
  hasTracks,
  isPlaying,
  onShuffle,
  onTogglePlay,
}: ArtistActionBarProps) => (
  <div className="flex items-center gap-3.5 md:gap-4.5">
    <ArtistPlayButton
      artistName={artistName}
      className="max-md:order-last max-md:size-10"
      disabled={!hasTracks}
      isPlaying={isPlaying}
      onClick={onTogglePlay}
    />

    <button
      aria-label={`Shuffle ${artistName}`}
      className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 max-md:order-3 max-md:ml-auto"
      disabled={!hasTracks}
      onClick={onShuffle}
      type="button"
    >
      <Shuffle aria-hidden="true" className="size-5 md:size-6.5" />
    </button>

    <FollowArtistButton
      artistId={artistId}
      artistName={artistName}
      className="max-md:order-1"
    />

    <div className="max-md:order-2">
      <ArtistMoreMenu artistId={artistId} artistName={artistName} />
    </div>
  </div>
)
