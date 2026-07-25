import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useEffect, useState } from 'react'
import { ROUTES } from '@/shared/routes'
import type {
  HeaderSuggestion,
  RecentSearch,
} from '@/widgets/MainHeader/ui/HeaderSearch/model/headerSearch.types'
import { useRecentSearches } from '@/widgets/MainHeader/ui/HeaderSearch/model/useRecentSearches'
import { useSearchSuggestions } from '@/widgets/MainHeader/ui/HeaderSearch/model/useSearchSuggestions'

export const useHeaderSearch = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim())
  const [isFocused, setIsFocused] = useState(false)
  const { recentSearches, rememberSearch } = useRecentSearches()
  const trimmedQuery = query.trim()
  const suggestions = useSearchSuggestions(trimmedQuery, debouncedQuery)

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedQuery(trimmedQuery),
      300,
    )
    return () => window.clearTimeout(timeoutId)
  }, [trimmedQuery])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!trimmedQuery) return
    rememberSearch({
      query: trimmedQuery,
      subtitle: 'Search',
      title: trimmedQuery,
    })
    setIsFocused(false)
    router.push(ROUTES.search(trimmedQuery))
  }

  const select = (item: HeaderSuggestion | RecentSearch) => {
    const nextQuery = item.query ?? item.title
    setQuery(nextQuery)
    rememberSearch(item)
    setIsFocused(false)
    router.push(item.href ?? ROUTES.search(nextQuery))
  }

  return {
    isFocused,
    query,
    recentSearches,
    select,
    setIsFocused,
    setQuery,
    submit,
    suggestions,
    trimmedQuery,
  }
}
