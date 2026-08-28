import { MusicCardLg } from '@/shared/ui'
import { LibraryMusicContainer } from '@/widgets/LeftSidebar/LibraryMusicSkeleton'
import { resolveLibraryHref } from '@/widgets/LeftSidebar/lib/resolveLibraryHref'
import { MusicCardSm } from '@/widgets/LeftSidebar/MusicCardSm'
import type { LibraryMusicItem } from '@/widgets/LeftSidebar/model/library.types'

type LibraryMusicListProps = {
  isCollapsed: boolean
  isExpanded: boolean
  items: LibraryMusicItem[]
  pathname: string
  playback: {
    currentPlaylistId?: string | null
    isPlaying: boolean
  }
}

export const LibraryMusicList = ({
  isCollapsed,
  isExpanded,
  items,
  pathname,
  playback,
}: LibraryMusicListProps) => (
  <LibraryMusicContainer isCollapsed={isCollapsed} isExpanded={isExpanded}>
    {items.map((item) => {
      const href = resolveLibraryHref(item)

      return isExpanded ? (
        <MusicCardLg
          description={`${item.type.slice(0, 1).toUpperCase()}${item.type.slice(1)} • ${item.username}`}
          href={href}
          id={item.id}
          imageUrl={item.cover}
          key={item.id}
          name={item.title}
        />
      ) : (
        <MusicCardSm
          isActive={pathname === href}
          isCollapsed={isCollapsed}
          isPlaying={
            playback.isPlaying && playback.currentPlaylistId === item.id
          }
          item={item}
          key={item.id}
        />
      )
    })}
  </LibraryMusicContainer>
)
