'use client'

import { cn, Input, ReviewIcon, SearchIcon } from '@bitrate/ui-react'
import { type FocusEvent, type KeyboardEvent, useId, useState } from 'react'
import { useI18n } from '@/shared/i18n'
import { HeaderSearchDropdown } from '@/widgets/MainHeader/ui/HeaderSearch/HeaderSearchDropdown'
import { useHeaderSearch } from '@/widgets/MainHeader/ui/HeaderSearch/model/useHeaderSearch'

type HeaderSearchProps = {
  className?: string
}

export const HeaderSearch = ({ className }: HeaderSearchProps) => {
  const { t } = useI18n()
  const search = useHeaderSearch()
  const listboxId = useId()
  const [requestedActiveIndex, setRequestedActiveIndex] = useState(-1)
  const variant = search.trimmedQuery.length === 0 ? 'recent' : 'suggestions'
  const items =
    variant === 'recent' ? search.recentSearches : search.suggestions
  const isDropdownOpen = search.isFocused && items.length > 0
  const activeIndex =
    requestedActiveIndex >= 0 && requestedActiveIndex < items.length
      ? requestedActiveIndex
      : -1
  const activeItem = activeIndex >= 0 ? items[activeIndex] : undefined
  const activeOptionId =
    isDropdownOpen && activeIndex >= 0
      ? `${listboxId}-option-${activeIndex}`
      : undefined

  const closeDropdown = () => {
    search.setIsFocused(false)
    setRequestedActiveIndex(-1)
  }

  const handleBlur = (event: FocusEvent<HTMLFormElement>) => {
    const nextTarget = event.relatedTarget
    if (
      nextTarget instanceof Node &&
      event.currentTarget.contains(nextTarget)
    ) {
      return
    }

    closeDropdown()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (items.length === 0) return
      event.preventDefault()
      search.setIsFocused(true)
      setRequestedActiveIndex((current) => {
        const normalizedCurrent =
          current >= 0 && current < items.length ? current : -1

        if (event.key === 'ArrowDown') {
          return (normalizedCurrent + 1) % items.length
        }

        return normalizedCurrent <= 0 ? items.length - 1 : normalizedCurrent - 1
      })
      return
    }

    if (event.key === 'Home' && isDropdownOpen) {
      event.preventDefault()
      setRequestedActiveIndex(0)
      return
    }

    if (event.key === 'End' && isDropdownOpen) {
      event.preventDefault()
      setRequestedActiveIndex(items.length - 1)
      return
    }

    if (event.key === 'Enter' && isDropdownOpen && activeItem) {
      event.preventDefault()
      search.select(activeItem)
      setRequestedActiveIndex(-1)
      return
    }

    if (event.key === 'Escape' && search.isFocused) {
      event.preventDefault()
      closeDropdown()
      return
    }

    if (event.key === 'Tab') closeDropdown()
  }

  return (
    <form
      className={cn('relative w-full xl:w-100', className)}
      onBlur={handleBlur}
      onSubmit={search.submit}
    >
      <SearchIcon
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform text-text-subdued"
        height={20}
        width={20}
      />
      <Input
        aria-activedescendant={activeOptionId}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={isDropdownOpen}
        aria-label={t('search.placeholder')}
        className="bg-background-highlight pl-12"
        onChange={(event) => {
          search.setQuery(event.target.value)
          search.setIsFocused(true)
          setRequestedActiveIndex(-1)
        }}
        onFocus={() => search.setIsFocused(true)}
        onKeyDown={handleKeyDown}
        placeholder={t('search.placeholder')}
        role="combobox"
        type="text"
        value={search.query}
        variant="search"
      />
      <button
        aria-label={t('nav.search')}
        className="absolute right-4 top-1/2 -translate-y-1/2 transform border-l-2 border-border pl-2 hover:opacity-80"
        type="submit"
      >
        <ReviewIcon className="text-text-subdued" height={20} width={20} />
      </button>
      {isDropdownOpen && (
        <HeaderSearchDropdown
          activeIndex={activeIndex}
          id={listboxId}
          items={items}
          onActiveIndexChange={setRequestedActiveIndex}
          onSelect={search.select}
          variant={variant}
        />
      )}
    </form>
  )
}
