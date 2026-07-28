'use client'

import { usePathname } from 'next/navigation'
import { selectMusicPlayer } from '@/entities/Player'
import { useAppSelector } from '@/shared/hooks'
import { LibraryMusicList } from '@/widgets/LeftSidebar/LibraryMusicList'
import { LibraryMusicSkeleton } from '@/widgets/LeftSidebar/LibraryMusicSkeleton'
import { useLibraryMusicItems } from '@/widgets/LeftSidebar/model/useLibraryMusicItems'

type LibraryMusicProps = {
  isCollapsed?: boolean
  isExpanded?: boolean
}

export const LibraryMusic = ({
  isCollapsed = false,
  isExpanded = false,
}: LibraryMusicProps) => {
  const player = useAppSelector(selectMusicPlayer)
  const pathname = usePathname()
  const library = useLibraryMusicItems()

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
