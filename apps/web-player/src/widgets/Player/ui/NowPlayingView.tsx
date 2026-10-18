'use client'

import { cn } from '@bitrate/ui-react'
import { useOverlayFocus } from '@shared/hooks'
import { ROUTES } from '@shared/routes'
import { ChevronDown, Heart, ListMusic, Mic2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ConnectDevicesPopover } from '@/features/BitrateConnect'
import { NowPlayingDetails } from './NowPlayingDetails'
import type { NowPlayingViewProps } from './nowPlaying.types'
import { PlayerControls } from './PlayerControls'

const iconLinkClassName =
  'flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground'

/**
 * The full Now Playing view (the design's "Now playing expanded"): a header with the playing
 * context, the cover, the title and like, the Seek Bar and Transport, then Bitrate Connect,
 * lyrics and the queue. Wide screens put the details (artist, Up Next, credits) beside it.
 */
export const NowPlayingView = ({
  artist,
  coverUrl,
  currentTime,
  duration,
  isLiked = false,
  isOpen,
  isPlaying,
  isShuffled,
  onClose,
  onLikeToggle,
  onNext,
  onPlayPause,
  onPrevious,
  onRepeatToggle,
  onSeek,
  onShuffleToggle,
  playlistTitle = 'Playlist',
  repeatMode,
  title,
}: NowPlayingViewProps) => {
  const dialogRef = useOverlayFocus<HTMLDivElement>({ isOpen, onClose })

  return (
    <div
      aria-label={`Now playing ${title}`}
      aria-modal="true"
      className={cn(
        'fixed inset-0 z-[80] overflow-y-auto overscroll-contain bg-background text-foreground transition-opacity duration-400 ease-out',
        isOpen
          ? 'visible opacity-100'
          : 'pointer-events-none invisible opacity-0',
      )}
      ref={dialogRef}
      role="dialog"
    >
      <header className="sticky top-0 z-20 flex h-13 items-center gap-1 bg-background px-2 pt-[env(safe-area-inset-top)] xl:px-6">
        <button
          aria-label="Minimize now playing"
          className="flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface"
          onClick={onClose}
          type="button"
        >
          <ChevronDown aria-hidden="true" size={22} />
        </button>
        <p className="min-w-0 flex-1 truncate font-[family-name:var(--font-landing-display)] text-lg font-semibold">
          {playlistTitle}
        </p>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))] xl:grid xl:grid-cols-[420px_minmax(0,1fr)] xl:px-8 xl:pt-6">
        <section className="flex flex-col gap-5">
          <Image
            alt={`Cover for ${title}`}
            className="aspect-square w-full rounded-xl object-cover shadow-2xl"
            height={420}
            priority
            src={coverUrl}
            unoptimized
            width={420}
          />

          <div className="flex items-center gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h2 className="truncate text-[32px] leading-[1.1] font-bold">
                {title}
              </h2>
              <p className="truncate text-sm text-muted-foreground">{artist}</p>
            </div>
            <button
              aria-label={isLiked ? `Unlike ${title}` : `Like ${title}`}
              aria-pressed={isLiked}
              className="shrink-0 rounded-full p-1 text-primary transition-transform hover:scale-110"
              onClick={onLikeToggle}
              type="button"
            >
              <Heart
                aria-hidden="true"
                fill={isLiked ? 'currentColor' : 'none'}
                size={24}
              />
            </button>
          </div>

          <PlayerControls
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            isShuffled={isShuffled}
            onNext={onNext}
            onPlayPause={onPlayPause}
            onPrevious={onPrevious}
            onRepeatToggle={onRepeatToggle}
            onSeek={onSeek}
            onShuffleToggle={onShuffleToggle}
            repeatMode={repeatMode}
            size="large"
          />

          <div className="flex items-center justify-between">
            <ConnectDevicesPopover
              iconSize={20}
              triggerClassName="flex size-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface"
            />
            <div className="flex items-center gap-1">
              <Link
                aria-label="Open lyrics"
                className={iconLinkClassName}
                href={ROUTES.lyrics}
                onClick={onClose}
              >
                <Mic2 aria-hidden="true" size={20} />
              </Link>
              <Link
                aria-label="Open queue"
                className={iconLinkClassName}
                href={ROUTES.queue}
                onClick={onClose}
              >
                <ListMusic aria-hidden="true" size={20} />
              </Link>
            </div>
          </div>
        </section>

        <NowPlayingDetails />
      </div>
    </div>
  )
}
