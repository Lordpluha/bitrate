'use client'

import {
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RecentsIcon,
  SearchIcon,
} from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes'
import { menuItemClassName, menuPanelClassName } from '@shared/ui'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Z_INDEX_CLASS } from '@/shared/constants'
import { type TranslationKey, useI18n } from '@/shared/i18n'
import {
  LIBRARY_SORTS,
  type LibrarySort,
} from '@/widgets/LeftSidebar/model/sortLibraryItems'

const SORT_LABELS = {
  creator: 'library.sortCreator',
  recent: 'library.sortRecentlyAdded',
  title: 'library.sortTitle',
} as const satisfies Record<LibrarySort, TranslationKey>

type LibraryControlsProps = {
  onSortChange: (sort: LibrarySort) => void
  sort: LibrarySort
}

export const LibraryControls = ({
  onSortChange,
  sort,
}: LibraryControlsProps) => {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mt-4 flex gap-2 justify-between items-center">
      <Link
        aria-label={t('nav.search')}
        className="duration-200 hover:opacity-70"
        href={ROUTES.search()}
      >
        <SearchIcon />
      </Link>
      <Popover onOpenChange={setIsOpen} open={isOpen}>
        <PopoverTrigger
          aria-label={`${t('library.sortBy')}: ${t(SORT_LABELS[sort])}`}
          className="duration-200 flex items-center gap-2 hover:opacity-70"
        >
          <span>{t(SORT_LABELS[sort])}</span>
          <RecentsIcon />
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className={cn(Z_INDEX_CLASS.popover, 'w-48', menuPanelClassName)}
          positionerClassName={Z_INDEX_CLASS.popover}
          sideOffset={6}
        >
          <div
            className="px-3 py-2 text-xs font-bold text-muted-foreground"
            id="library-sort-label"
          >
            {t('library.sortBy')}
          </div>
          <div aria-labelledby="library-sort-label" role="menu">
            {LIBRARY_SORTS.map((option) => (
              <button
                aria-checked={option === sort}
                className={cn(
                  menuItemClassName,
                  'justify-between',
                  option === sort && 'text-accent [&_svg]:text-accent',
                )}
                key={option}
                onClick={() => {
                  onSortChange(option)
                  setIsOpen(false)
                }}
                role="menuitemradio"
                type="button"
              >
                {t(SORT_LABELS[option])}
                {option === sort && <Check aria-hidden="true" size={16} />}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
