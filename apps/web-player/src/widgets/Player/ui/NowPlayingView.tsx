'use client'

import { cn } from '@bitrate/ui-react'
import { useOverlayFocus } from '@shared/hooks'
import { ROUTES } from '@shared/routes'
import { MediaImage } from '@shared/ui/MediaImage'
import { ChevronDown, ListMusic, Mic2 } from 'lucide-react'
import Link from 'next/link'
import { PlayerMirror } from '@/entities/Player'
import { LikeButton } from '@/entities/Track'
import { ConnectDevicesPopover } from '@/features/BitrateConnect'
import { useI18n } from '@/shared/i18n'
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
  isLiked = false,
  isOpen,
  onClose,
  onLikeToggle,
  onNext,
  onPrevious,
  playlistTitle,
  title,
}: NowPlayingViewProps) => {
  const { t } = useI18n()
  const dialogRef = useOverlayFocus<HTMLDivElement>({ isOpen, onClose })

  return (
    <div
      aria-label={t('player.nowPlayingTitle', { title })}
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
          aria-label={t('player.minimize')}
          className="flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface"
          onClick={onClose}
          type="button"
        >
          <ChevronDown aria-hidden="true" size={22} />
        </button>
        <p className="min-w-0 flex-1 truncate font-[family-name:var(--font-landing-display)] text-lg font-semibold">
          {playlistTitle ?? t('common.playlist')}
        </p>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))] xl:grid xl:grid-cols-[420px_minmax(0,1fr)] xl:px-8 xl:pt-6">
        <section className="flex flex-col gap-5">
          <MediaImage
            alt={t('player.coverFor', { title })}
            className="aspect-square w-full rounded-xl object-cover shadow-2xl"
            fallback="track"
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
            {onLikeToggle ? (
              <LikeButton
                isLiked={isLiked}
                onToggle={onLikeToggle}
                size={24}
                trackTitle={title}
              />
            ) : null}
          </div>

          <PlayerControls
            onNext={onNext}
            onPrevious={onPrevious}
            size="large"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ConnectDevicesPopover
                iconSize={20}
                triggerClassName="flex size-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface"
              />
              {/* Shown only for a CMAF track with more than one rendition. */}
              <PlayerMirror>
                <bitrate-player-quality />
              </PlayerMirror>
            </div>
            <div className="flex items-center gap-1">
              <Link
                aria-label={t('player.openLyrics')}
                className={iconLinkClassName}
                href={ROUTES.lyrics}
                onClick={onClose}
              >
                <Mic2 aria-hidden="true" size={20} />
              </Link>
              <Link
                aria-label={t('player.openQueue')}
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
