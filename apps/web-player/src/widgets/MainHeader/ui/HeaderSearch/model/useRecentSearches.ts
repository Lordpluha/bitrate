import { useEffect, useState } from 'react'
import type { RecentSearch } from '@/widgets/MainHeader/ui/HeaderSearch/model/headerSearch.types'

const storageKey = 'bitrate:web-player:recent-searches'
const limit = 8

const isOptionalString = (value: unknown) =>
  value === undefined || typeof value === 'string'

const isRecentSearch = (value: unknown): value is RecentSearch => {
  if (typeof value !== 'object' || value === null) return false
  const search = value as Record<string, unknown>

  return (
    typeof search.title === 'string' &&
    typeof search.subtitle === 'string' &&
    isOptionalString(search.href) &&
    isOptionalString(search.image) &&
    isOptionalString(search.query)
  )
}

export const useRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])

  useEffect(() => {
    const storedValue = window.localStorage.getItem(storageKey)
    if (!storedValue) return

    try {
      const value = JSON.parse(storedValue)
      if (Array.isArray(value)) {
        setRecentSearches(value.filter(isRecentSearch).slice(0, limit))
      }
    } catch {
      window.localStorage.removeItem(storageKey)
    }
  }, [])

  const rememberSearch = (search: RecentSearch) => {
    setRecentSearches((current) => {
      const next = [
        search,
        ...current.filter(
          (item) =>
            item.title !== search.title || item.subtitle !== search.subtitle,
        ),
      ].slice(0, limit)
      window.localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })
  }

  return { recentSearches, rememberSearch }
}
