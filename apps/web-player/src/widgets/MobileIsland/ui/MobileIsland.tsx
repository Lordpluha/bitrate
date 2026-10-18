'use client'

import { cn } from '@bitrate/ui-react'
import {
  selectCurrentTrack,
  selectIsPlaying,
  usePlayerStore,
} from '@entities/Player'
import { ROUTES } from '@shared/routes'
import { MediaImage } from '@shared/ui/MediaImage'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { House, Library, Pause, Play, Search } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Z_INDEX_CLASS } from '@/shared/constants'
import { useI18n } from '@/shared/i18n'

type MobileIslandProps = {
  className?: string
  /** Opens the full Now Playing view from the artwork. */
  onExpand: () => void
}

const tabClassName =
  'flex size-13 shrink-0 items-center justify-center rounded-full transition-colors'

/**
 * The phone's navigation and player in one floating island (the design's Mobile/Island): the
 * playing artwork in a gradient ring, Home / Search / Library, and play. Without a track it is
 * navigation only. Create lives in the header and in Library.
 */
export function MobileIsland({ className, onExpand }: MobileIslandProps) {
  const { t } = useI18n()
  const pathname = usePathname()
  const currentTrack = usePlayerStore(selectCurrentTrack)
  const isPlaying = usePlayerStore(selectIsPlaying)
  const togglePlay = usePlayerStore((state) => state.togglePlay)
  const tabs = [
    {
      href: ROUTES.main,
      icon: House,
      isActive: pathname === ROUTES.main,
      label: t('nav.home'),
    },
    {
      href: ROUTES.search(),
      icon: Search,
      isActive: pathname.startsWith(ROUTES.search()),
      label: t('nav.search'),
    },
    {
      href: ROUTES.library,
      icon: Library,
      isActive:
        pathname.startsWith(ROUTES.library) ||
        pathname.startsWith(ROUTES.likedSongs),
      label: t('nav.library'),
    },
  ]

  return (
    <nav
      aria-label={t('nav.main')}
      className={cn(
        Z_INDEX_CLASS.bottomNavigation,
        'fixed inset-x-4 bottom-[calc(18px+env(safe-area-inset-bottom))] flex h-16.5 items-center gap-1 rounded-full border border-border bg-card/90 px-2 shadow-2xl backdrop-blur-xl',
        className,
      )}
    >
      {currentTrack ? (
        <button
          aria-label={`Open now playing: ${currentTrack.title}`}
          className="size-12.5 shrink-0 rounded-full bg-linear-135 from-magenta-500 to-primary p-px"
          onClick={onExpand}
          type="button"
        >
          <span className="flex size-full items-center justify-center rounded-full bg-card">
            <MediaImage
              alt=""
              className="size-10 rounded-full object-cover"
              fallback="track"
              height={40}
              src={getTrackCoverUrl(currentTrack.cover)}
              unoptimized
              width={40}
            />
          </span>
        </button>
      ) : null}

      <div className="flex h-full min-w-0 flex-1 items-center justify-around gap-3">
        {tabs.map(({ href, icon: Icon, isActive, label }) => (
          <Link
            aria-current={isActive ? 'page' : undefined}
            aria-label={label}
            className={cn(
              tabClassName,
              isActive
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
            href={href}
            key={href}
          >
            <Icon aria-hidden="true" size={20} />
          </Link>
        ))}
      </div>

      {currentTrack ? (
        <button
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="flex size-12.5 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-transform active:scale-95"
          onClick={togglePlay}
          type="button"
        >
          {isPlaying ? (
            <Pause aria-hidden="true" fill="currentColor" size={18} />
          ) : (
            <Play
              aria-hidden="true"
              className="ml-0.5"
              fill="currentColor"
              size={18}
            />
          )}
        </button>
      ) : null}
    </nav>
  )
}
