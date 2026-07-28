import { SearchIcon } from '@spotify/ui-react'
import Image from 'next/image'
import type {
  HeaderSuggestion,
  RecentSearch,
} from '@/widgets/MainHeader/ui/HeaderSearch/model/headerSearch.types'

type HeaderSearchDropdownProps = {
  items: Array<HeaderSuggestion | RecentSearch>
  onSelect: (item: HeaderSuggestion | RecentSearch) => void
  variant: 'recent' | 'suggestions'
}

export const HeaderSearchDropdown = ({
  items,
  onSelect,
  variant,
}: HeaderSearchDropdownProps) => (
  <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-md bg-surface p-3 shadow-2xl custom-scrollbar">
    {variant === 'recent' && (
      <div className="px-1 pb-2 text-sm font-bold text-text">
        Recent searches
      </div>
    )}
    <div className="space-y-1">
      {items.map((item) => {
        const isQuery = 'type' in item && item.type === 'query'

        return (
          <button
            className={
              variant === 'recent'
                ? 'grid w-full grid-cols-[44px_minmax(0,1fr)] items-center gap-3 rounded px-1 py-1.5 text-left transition-colors hover:bg-surface-hover'
                : 'grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded px-1 py-1.5 text-left transition-colors hover:bg-surface-hover'
            }
            key={`${item.title}-${item.subtitle}`}
            onClick={() => onSelect(item)}
            onMouseDown={(event) => event.preventDefault()}
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
              <span className="text-xs text-text-subdued">Search</span>
            )}
          </button>
        )
      })}
    </div>
  </div>
)
