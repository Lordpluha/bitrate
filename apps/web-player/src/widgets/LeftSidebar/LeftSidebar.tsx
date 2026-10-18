'use client'

import { usePersistedState } from '@shared/hooks'
import { useState } from 'react'
import { useI18n } from '@/shared/i18n'
import type { LibraryItemType } from '@/widgets/LeftSidebar/model/library.types'
import { isLibrarySort } from '@/widgets/LeftSidebar/model/sortLibraryItems'
import { useCreateLibraryPlaylist } from '@/widgets/LeftSidebar/model/useCreateLibraryPlaylist'
import { CreatePlaylistMenu } from './CreatePlaylistMenu'
import { LibraryControls } from './LibraryControls'
import { LibraryHeader } from './LibraryHeader'
import { LibraryMusic } from './LibraryMusic'
import { LibraryNav } from './LibraryNav'
import { LibraryTags } from './LibraryTags'

type LeftSidebarProps = {
  isCollapsed?: boolean
  isExpanded?: boolean
  onToggleCollapsed?: () => void
  onToggleExpanded?: () => void
}

export const LeftSidebar = ({
  isCollapsed = false,
  isExpanded = false,
  onToggleCollapsed,
  onToggleExpanded,
}: LeftSidebarProps) => {
  const [selectedTypes, setSelectedTypes] = useState<LibraryItemType[]>([])
  const [storedSort, setSort] = usePersistedState<unknown>(
    'bitrate:library-sort',
    'recent',
  )
  const sort = isLibrarySort(storedSort) ? storedSort : 'recent'
  const { t } = useI18n()
  const playlist = useCreateLibraryPlaylist()

  const toggleType = (type: LibraryItemType) =>
    setSelectedTypes((previous) =>
      previous.includes(type)
        ? previous.filter((value) => value !== type)
        : [...previous, type],
    )

  return (
    <div
      className={
        isCollapsed
          ? 'flex h-full flex-col items-center gap-4 px-2 py-5.5'
          : 'flex h-full flex-col gap-4 px-4.5 py-5.5'
      }
    >
      <LibraryHeader
        isCollapsed={isCollapsed}
        isExpanded={isExpanded}
        onToggleCollapsed={onToggleCollapsed}
        onToggleExpanded={onToggleExpanded}
      />
      {isExpanded ? null : <LibraryNav isCollapsed={isCollapsed} />}
      <hr className="w-full border-border" />
      {!isCollapsed && !isExpanded && (
        <div className="-my-1.5 flex items-center justify-between">
          <h2 className="text-[10px] tracking-wide text-muted-foreground uppercase">
            {t('library.playlists')}
          </h2>
          <CreatePlaylistMenu
            isPending={playlist.isPending}
            onCreate={playlist.create}
          />
        </div>
      )}
      {!isCollapsed && (
        <LibraryTags onToggle={toggleType} selectedTypes={selectedTypes} />
      )}
      {!isCollapsed && <LibraryControls onSortChange={setSort} sort={sort} />}
      <LibraryMusic
        isCollapsed={isCollapsed}
        isExpanded={isExpanded}
        selectedTypes={selectedTypes}
        sort={sort}
      />
    </div>
  )
}
