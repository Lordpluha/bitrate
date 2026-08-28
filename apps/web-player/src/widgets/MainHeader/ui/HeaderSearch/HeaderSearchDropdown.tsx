'use client'

import { cn, SearchIcon } from '@spotify/ui-react'
import Image from 'next/image'
import { useI18n } from '@/shared/i18n'
import type {
  HeaderSuggestion,
  RecentSearch,
} from '@/widgets/MainHeader/ui/HeaderSearch/model/headerSearch.types'

type HeaderSearchDropdownProps = {
  activeIndex: number
  id: string
  items: Array<HeaderSuggestion | RecentSearch>
  onActiveIndexChange: (index: number) => void
  onSelect: (item: HeaderSuggestion | RecentSearch) => void
  variant: 'recent' | 'suggestions'
}

export const HeaderSearchDropdown = ({
  activeIndex,
  id,
  items,
  onActiveIndexChange,
  onSelect,
  variant,
}: HeaderSearchDropdownProps) => {
  const { t } = useI18n()

  return (
    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-md border border-border bg-background-tinted p-3 shadow-2xl custom-scrollbar">
      {variant === 'recent' && (
        <div className="px-1 pb-2 text-sm font-bold text-text">
          {t('search.recent')}
        </div>
      )}
      <div
        aria-label={
          variant === 'recent' ? t('search.recent') : t('search.suggestions')
        }
        className="space-y-1"
        id={id}
        role="listbox"
      >
        {items.map((item, index) => {
          const isQuery = 'type' in item && item.type === 'query'
          const isActive = index === activeIndex

          return (
            <button
              aria-selected={isActive}
              className={cn(
                variant === 'recent'
                  ? 'grid-cols-[44px_minmax(0,1fr)]'
                  : 'grid-cols-[44px_minmax(0,1fr)_auto]',
                'grid w-full items-center gap-3 rounded px-1 py-1.5 text-left transition-colors hover:bg-surface-hover',
                isActive && 'bg-surface-hover',
              )}
              id={`${id}-option-${index}`}
              key={`${item.title}-${item.subtitle}`}
              onClick={() => onSelect(item)}
              onMouseDown={(event) => event.preventDefault()}
              onMouseMove={() => onActiveIndexChange(index)}
              role="option"
              tabIndex={-1}
              type="button"
            >
              {item.image ? (
                <Image
                  alt={item.title}
                  className="size-11 rounded object-cover"
                  height={44}
                  src={item.image}
                  unoptimized
                  width={44}
                />
              ) : (
                <span className="flex size-11 items-center justify-center rounded-full text-text-subdued">
                  <SearchIcon height={26} width={26} />
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-text">
                  {item.title}
                </span>
                {(!isQuery || variant === 'recent') && (
                  <span className="block truncate text-xs text-text-subdued">
                    {item.subtitle}
                  </span>
                )}
              </span>
              {isQuery && variant === 'suggestions' && (
                <span className="text-xs text-text-subdued">
                  {t('common.search')}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
