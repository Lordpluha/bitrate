'use client'

import { cn } from '@spotify/ui-react'
import { Pause, Play } from 'lucide-react'

export type ArtistPlayButtonProps = {
  artistName: string
  className?: string
  disabled?: boolean
  isPlaying: boolean
  onClick: () => void
  size?: 'compact' | 'hero'
}

/** Shared primary play control used by the full and compact artist headers. */
export const ArtistPlayButton = ({
  artistName,
  className,
  disabled = false,
  isPlaying,
  onClick,
  size = 'hero',
}: ArtistPlayButtonProps) => (
  <button
    aria-label={isPlaying ? `Pause ${artistName}` : `Play ${artistName}`}
    className={cn(
      'flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition duration-150 hover:scale-105 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
      size === 'hero' ? 'size-14' : 'size-12',
      className,
    )}
    disabled={disabled}
    onClick={onClick}
    type="button"
  >
    {isPlaying ? (
      <Pause aria-hidden="true" fill="currentColor" size={22} />
    ) : (
      <Play
        aria-hidden="true"
        className="ml-0.5"
        fill="currentColor"
        size={22}
      />
    )}
  </button>
)
