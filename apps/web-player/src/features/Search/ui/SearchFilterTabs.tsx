'use client'

import { cn } from '@bitrate/ui-react'
import type { KeyboardEvent } from 'react'
import type { searchFilterTabs } from '@/features/Search/model/search.constants'

export type SearchFilterTab = (typeof searchFilterTabs)[number]

export type SearchFilterTabsProps = {
  activeTab: SearchFilterTab
  availableTabs: SearchFilterTab[]
  onTabChange: (tab: SearchFilterTab) => void
}

/** Scrollable filter row above search results. */
export const SearchFilterTabs = ({
  activeTab,
  availableTabs,
  onTabChange,
}: SearchFilterTabsProps) => {
  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return

    event.preventDefault()
    const lastIndex = availableTabs.length - 1
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? lastIndex
          : event.key === 'ArrowLeft'
            ? (currentIndex - 1 + availableTabs.length) % availableTabs.length
            : (currentIndex + 1) % availableTabs.length
    const nextTab = availableTabs[nextIndex]
    const nextButton = event.currentTarget.parentElement?.querySelectorAll(
      '[role="tab"]',
    )[nextIndex] as HTMLButtonElement | undefined

    if (nextTab) onTabChange(nextTab)
    nextButton?.focus()
  }

  return (
    <div
      aria-label="Filter search results"
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
      role="tablist"
    >
      {availableTabs.map((tab, index) => (
        <button
          aria-selected={activeTab === tab}
          className={cn(
            'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
            activeTab === tab
              ? 'bg-text text-background'
              : 'bg-surface text-text hover:bg-surface-hover',
          )}
          key={tab}
          onClick={() => onTabChange(tab)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          role="tab"
          tabIndex={activeTab === tab ? 0 : -1}
          type="button"
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
