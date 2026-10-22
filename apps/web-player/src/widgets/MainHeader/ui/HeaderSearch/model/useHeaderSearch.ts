import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useEffect, useState } from 'react'
import { useSearchHistory } from '@/features/Search'
import { useAuth, useDebouncedValue } from '@/shared/hooks'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'
import type {
  HeaderSuggestion,
  RecentSearch,
} from '@/widgets/MainHeader/ui/HeaderSearch/model/headerSearch.types'
import { useRecentSearches } from '@/widgets/MainHeader/ui/HeaderSearch/model/useRecentSearches'
import { useSearchSuggestions } from '@/widgets/MainHeader/ui/HeaderSearch/model/useSearchSuggestions'

/** Suggestions wait until typing pauses this long. */
const SUGGESTIONS_DEBOUNCE_MS = 300

export const useHeaderSearch = () => {
  const { isAuthenticated } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [isFocused, setIsFocused] = useState(false)
  const { recentSearches: localRecentSearches, rememberSearch } =
    useRecentSearches()
  const { data: serverHistory } = useSearchHistory(1, 8, isAuthenticated)
  const trimmedQuery = query.trim()
  const debouncedQuery = useDebouncedValue({
    delayMs: SUGGESTIONS_DEBOUNCE_MS,
    value: trimmedQuery,
  })
  /* signed-in users see their account's search history; guests see this browser's */
  const recentSearches = (
    isAuthenticated
      ? (serverHistory?.data.map((item) => ({
          query: item.query,
          subtitle: t('common.search'),
          title: item.query,
        })) ?? [])
      : localRecentSearches
  )
    .filter(
      (item, index, items) =>
        items.findIndex(
          (candidate) =>
            candidate.title.toLocaleLowerCase() ===
            item.title.toLocaleLowerCase(),
        ) === index,
    )
    .slice(0, 8)
  const suggestions = useSearchSuggestions({
    query: trimmedQuery,
    debouncedQuery,
    history: recentSearches.map((item) => item.query ?? item.title),
  })

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!trimmedQuery) return
    rememberSearch({
      query: trimmedQuery,
      subtitle: t('common.search'),
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
