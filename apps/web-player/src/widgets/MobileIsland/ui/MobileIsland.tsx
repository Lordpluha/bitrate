'use client'

import { cn } from '@bitrate/ui-react'
import {
  PlayerMirror,
  selectCurrentTrack,
  usePlayerNavigationTracks,
  usePlayerStore,
} from '@entities/Player'
import { ROUTES } from '@shared/routes'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { House, Library, Search } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { CSSProperties } from 'react'
import { Z_INDEX_CLASS } from '@/shared/constants'
import { useI18n } from '@/shared/i18n'
import { useIslandSkipGesture } from '@/widgets/MobileIsland/model/useIslandSkipGesture'
import { IslandArtwork } from '@/widgets/MobileIsland/ui/IslandArtwork'

type MobileIslandProps = {
  className?: string
  /** Opens the full Now Playing view from the artwork. */
  onExpand: () => void
}

/** The island's 50px Play disc: foreground on background, the package's 18px icon unscaled. */
const ISLAND_PLAY_THEME: CSSProperties = {
  '--bitrate-player-play-background': 'var(--color-foreground)',
  '--bitrate-player-play-foreground': 'var(--color-background)',
  '--bitrate-player-play-size': '3.125rem',
}

const tabClassName =
  'flex size-13 shrink-0 items-center justify-center rounded-full transition-colors'

/**
 * The phone's navigation and player in one floating island (the design's Mobile/Island): the
 * playing artwork in a gradient ring, Home / Search / Library, and play. Swiping sideways
 * anywhere on it skips: the neighbour's cover slides into the ring with its title above the
 * island. Without a track it is navigation only. Create lives in the header and in Library.
 */
export function MobileIsland({ className, onExpand }: MobileIslandProps) {
  const { t } = useI18n()
  const pathname = usePathname()
  const currentTrack = usePlayerStore(selectCurrentTrack)
  const changeTrack = usePlayerStore((state) => state.changeTrack)
  const { nextTrack, previousTrack } = usePlayerNavigationTracks()
  const skip = useIslandSkipGesture({
    canSkip: (direction) =>
      Boolean(direction === 'next' ? nextTrack : previousTrack),
    onSkip: changeTrack,
  })
  const neighbour =
    skip.direction === 'next'
      ? nextTrack
      : skip.direction === 'prev'
        ? previousTrack
        : null
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
        'fixed inset-x-4 bottom-[calc(18px+env(safe-area-inset-bottom))] flex h-16.5 touch-pan-y items-center gap-1 rounded-full border border-border bg-card/90 px-2 shadow-2xl backdrop-blur-xl select-none',
        className,
      )}
      {...(currentTrack ? skip.handlers : {})}
    >
      {currentTrack ? (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-full left-1/2 mb-2.5 flex h-7 max-w-[calc(100%-2rem)] -translate-x-1/2 items-center rounded-full border border-border bg-card/90 px-3 font-mono text-[11px] tracking-[0.9px] whitespace-nowrap text-foreground uppercase shadow-lg backdrop-blur-xl"
            style={{ opacity: neighbour ? skip.progress : 0 }}
          >
            <span className="truncate">
              {neighbour
                ? `${t(skip.direction === 'next' ? 'player.skipCueNext' : 'player.skipCuePrevious')} · ${neighbour.title}`
                : null}
            </span>
          </span>
          <IslandArtwork
            coverUrl={getTrackCoverUrl(currentTrack.cover)}
            direction={skip.direction}
            label={`Open now playing: ${currentTrack.title}`}
            neighbourCoverUrl={
              neighbour ? getTrackCoverUrl(neighbour.cover) : null
            }
            offset={skip.offset}
            onExpand={onExpand}
          />
        </>
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
        <PlayerMirror className="shrink-0" style={ISLAND_PLAY_THEME}>
          <bitrate-player-transport controls="play" />
        </PlayerMirror>
      ) : null}
    </nav>
  )
}
