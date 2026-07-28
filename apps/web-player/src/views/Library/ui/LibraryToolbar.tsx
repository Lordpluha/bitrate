'use client'

import { cn } from '@spotify/ui-react'
import { ArrowDownUp, Grid3X3, List, SearchIcon, X } from 'lucide-react'
import { useState } from 'react'
import type { LibraryControls } from '@/views/Library/model/library.types'
import { libraryTabs } from '@/views/Library/model/library.utils'

type LibraryToolbarProps = {
  controls: LibraryControls
  onChange: (controls: Partial<LibraryControls>) => void
}

export const LibraryToolbar = ({ controls, onChange }: LibraryToolbarProps) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const isSearchVisible = isMobileSearchOpen || controls.query.length > 0

  return (
    <>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        {libraryTabs.map((tab) => (
          <button
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              controls.activeSection === tab.id
                ? 'bg-text text-background'
                : 'bg-surface text-text hover:bg-surface-hover',
            )}
            key={tab.id}
            onClick={() => onChange({ activeSection: tab.id })}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative border-t border-border pt-4 xl:hidden">
        <div className="flex h-10 items-center justify-between">
          <button
            className="flex min-h-10 items-center gap-2 rounded-full px-1 text-base font-semibold text-text"
            onClick={() =>
              onChange({
                sortMode: controls.sortMode === 'recent' ? 'title' : 'recent',
              })
            }
            type="button"
          >
            <ArrowDownUp size={19} />
            {controls.sortMode === 'recent' ? 'Recent' : 'Title'}
          </button>
          <button
            aria-label={
              controls.viewMode === 'list'
                ? 'Switch to grid view'
                : 'Switch to list view'
            }
            className="flex size-10 items-center justify-center rounded-full text-text hover:bg-surface"
            onClick={() =>
              onChange({
                viewMode: controls.viewMode === 'list' ? 'grid' : 'list',
              })
            }
            type="button"
          >
            {controls.viewMode === 'list' ? (
              <Grid3X3 size={21} />
            ) : (
              <List size={22} />
            )}
          </button>
        </div>

        <div
          className={cn(
            'absolute inset-x-0 top-3 z-10 flex h-12 items-center rounded-md bg-surface px-3 transition-[opacity,transform] duration-200',
            isSearchVisible
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-1 opacity-0',
          )}
        >
          <SearchIcon className="shrink-0 text-text-subdued" size={19} />
          <input
            aria-label="Search in Your Library"
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-text outline-none"
            id="library-filter"
            onBlur={() => setIsMobileSearchOpen(false)}
            onChange={(event) => onChange({ query: event.target.value })}
            onFocus={() => setIsMobileSearchOpen(true)}
            placeholder="Search in Your Library"
            value={controls.query}
          />
          <button
            aria-label="Clear library search"
            className="rounded-full p-1 text-text-subdued hover:text-text"
            onClick={() => {
              onChange({ query: '' })
              setIsMobileSearchOpen(false)
            }}
            type="button"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="hidden flex-wrap gap-3 xl:flex">
        <label className="relative min-w-64 max-w-100 flex-1">
          <SearchIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subdued"
            size={18}
          />
          <input
            className="h-10 w-full rounded-md bg-surface pl-10 pr-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/30"
            id="library-filter-desktop"
            onChange={(event) => onChange({ query: event.target.value })}
            placeholder="Filter your library"
            value={controls.query}
          />
        </label>

        <select
          className="h-10 rounded-md bg-surface px-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/30"
          onChange={(event) =>
            onChange({
              sortMode: event.target.value as LibraryControls['sortMode'],
            })
          }
          value={controls.sortMode}
        >
          <option value="recent">Recent</option>
          <option value="title">Title</option>
        </select>
      </div>
    </>
  )
}
