'use client'

import { cn, Input, ReviewIcon, SearchIcon } from '@spotify/ui-react'
import { HeaderSearchDropdown } from '@/widgets/MainHeader/ui/HeaderSearch/HeaderSearchDropdown'
import { useHeaderSearch } from '@/widgets/MainHeader/ui/HeaderSearch/model/useHeaderSearch'

type HeaderSearchProps = {
  className?: string
}

export const HeaderSearch = ({ className }: HeaderSearchProps) => {
  const search = useHeaderSearch()
  const showRecent = search.isFocused && search.trimmedQuery.length === 0
  const showSuggestions = search.isFocused && search.trimmedQuery.length > 0

  return (
    <form
      className={cn('relative w-full xl:w-100', className)}
      onSubmit={search.submit}
    >
      <SearchIcon
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform text-text-subdued"
        height={20}
        width={20}
      />
      <Input
        className="pl-12"
        onBlur={() => search.setIsFocused(false)}
        onChange={(event) => search.setQuery(event.target.value)}
        onFocus={() => search.setIsFocused(true)}
        placeholder="What do you want to play?"
        type="text"
        value={search.query}
        variant="search"
      />
      <button
        aria-label="Open search page"
        className="absolute right-4 top-1/2 -translate-y-1/2 transform border-l-2 border-border pl-2 hover:opacity-80"
        type="submit"
      >
        <ReviewIcon className="text-text-subdued" height={20} width={20} />
      </button>
      {showRecent && (
        <HeaderSearchDropdown
          items={search.recentSearches}
          onSelect={search.select}
          variant="recent"
        />
      )}
      {showSuggestions && (
        <HeaderSearchDropdown
          items={search.suggestions}
          onSelect={search.select}
          variant="suggestions"
        />
      )}
    </form>
  )
}
