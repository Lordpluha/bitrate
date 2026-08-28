'use client'

import { cn } from '@spotify/ui-react'
import type { CSSProperties } from 'react'
import { ArtistPlayButton } from '@/views/Artist/ui/ArtistPlayButton'

export type ArtistCompactHeaderProps = {
  artistName: string
  backgroundColor: string
  hasTracks: boolean
  isPlaying: boolean
  isVisible: boolean
  onTogglePlay: () => void
}

/** Sticky artist identity shown after the hero leaves the scroll viewport. */
export const ArtistCompactHeader = ({
  artistName,
  backgroundColor,
  hasTracks,
  isPlaying,
  isVisible,
  onTogglePlay,
}: ArtistCompactHeaderProps) => (
  <div
    className="sticky top-0 z-40 h-0"
    style={{ '--artist-header': backgroundColor } as CSSProperties}
  >
    <div
      aria-hidden={!isVisible}
      className={cn(
        'absolute inset-x-0 top-0 flex h-16 items-center gap-3 bg-[var(--artist-header)] px-4 shadow-sm transition-transform duration-200 sm:px-5',
        isVisible
          ? 'translate-y-0 pointer-events-auto'
          : '-translate-y-full pointer-events-none',
      )}
    >
      <ArtistPlayButton
        artistName={artistName}
        disabled={!hasTracks}
        isPlaying={isPlaying}
        onClick={onTogglePlay}
        size="compact"
      />
      <p className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">
        {artistName}
      </p>
    </div>
  </div>
)
