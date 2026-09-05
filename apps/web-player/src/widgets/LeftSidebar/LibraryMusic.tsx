'use client'

import { usePathname } from 'next/navigation'
import { selectMusicPlayer, usePlayerStore } from '@/entities/Player'
import { LibraryMusicList } from '@/widgets/LeftSidebar/LibraryMusicList'
import { LibraryMusicSkeleton } from '@/widgets/LeftSidebar/LibraryMusicSkeleton'
import type { LibraryItemType } from '@/widgets/LeftSidebar/model/library.types'
import { useLibraryItems } from '@/widgets/LeftSidebar/model/useLibraryItems'

type LibraryMusicProps = {
  isCollapsed?: boolean
  isExpanded?: boolean
  selectedTypes?: LibraryItemType[]
}

export const LibraryMusic = ({
  isCollapsed = false,
  isExpanded = false,
  selectedTypes = [],
}: LibraryMusicProps) => {
  const player = usePlayerStore(selectMusicPlayer)
  const pathname = usePathname()
  const library = useLibraryItems({ selectedTypes })

  if (library.isLoading) {
    return (
      <LibraryMusicSkeleton isCollapsed={isCollapsed} isExpanded={isExpanded} />
    )
  }

  return (
    <LibraryMusicList
      isCollapsed={isCollapsed}
      isExpanded={isExpanded}
      items={library.items}
      pathname={pathname}
      playback={{
        currentPlaylistId: player.currentPlaylistId,
        isPlaying: player.isPlaying,
      }}
    />
  )
}
