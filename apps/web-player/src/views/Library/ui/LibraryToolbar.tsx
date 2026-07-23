'use client'

import { cn } from '@spotify/ui-react'
import { SearchIcon } from 'lucide-react'
import type {
  LibrarySection,
  SortMode,
} from '@/views/Library/model/library.types'
import { libraryTabs } from '@/views/Library/model/library.utils'

type LibraryToolbarProps = {
  activeSection: LibrarySection
  onSectionChange: (section: LibrarySection) => void
  onQueryChange: (query: string) => void
  onSortChange: (sortMode: SortMode) => void
}

export const LibraryToolbar = ({
  activeSection,
  onQueryChange,
  onSectionChange,
  onSortChange,
}: LibraryToolbarProps) => (
  <>
    <div className="flex flex-wrap items-center gap-2">
      {libraryTabs.map((tab) => (
        <button
          className={cn(
            'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
            activeSection === tab.id
              ? 'bg-text text-background'
              : 'bg-surface text-text hover:bg-surface-hover',
          )}
          key={tab.id}
          onClick={() => onSectionChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>

    <div className="flex flex-wrap gap-3">
      <label className="relative min-w-64 flex-1 max-w-100">
        <SearchIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subdued"
          size={18}
        />
        <input
          className="h-10 w-full rounded-md bg-surface pl-10 pr-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/30"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Filter your library"
        />
      </label>

      <select
        className="h-10 rounded-md bg-surface px-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/30"
        onChange={(event) => onSortChange(event.target.value as SortMode)}
      >
        <option value="recent">Recent</option>
        <option value="title">Title</option>
      </select>
    </div>
  </>
)
