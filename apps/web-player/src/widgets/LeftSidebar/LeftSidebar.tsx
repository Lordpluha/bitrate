'use client'

import { useState } from 'react'
import type { LibraryItemType } from '@/widgets/LeftSidebar/model/library.types'
import { LibraryControls } from './LibraryControls'
import { LibraryHeader } from './LibraryHeader'
import { LibraryMusic } from './LibraryMusic'
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
          ? 'h-full px-2 py-4 flex flex-col items-center'
          : 'h-full p-4 flex flex-col'
      }
    >
      <LibraryHeader
        isCollapsed={isCollapsed}
        isExpanded={isExpanded}
        onToggleCollapsed={onToggleCollapsed}
        onToggleExpanded={onToggleExpanded}
      />
      {!isCollapsed && (
        <LibraryTags onToggle={toggleType} selectedTypes={selectedTypes} />
      )}
      {!isCollapsed && <LibraryControls />}
      <LibraryMusic
        isCollapsed={isCollapsed}
        isExpanded={isExpanded}
        selectedTypes={selectedTypes}
      />
    </div>
  )
}
