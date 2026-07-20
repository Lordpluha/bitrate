'use client'

import {
  useSearch,
  type WebPlayerSearchType,
} from '@features/Search/api/client'
import { ROUTES } from '@shared/routes'
import {
  getAlbumCoverUrl,
  getPlaylistCoverUrl,
  getTrackCoverUrl,
} from '@shared/utils/mediaUrl'
import { Input, ReviewIcon, SearchIcon } from '@spotify/ui-react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useEffect, useState } from 'react'

type HeaderSuggestion = {
  href?: string
  image?: string
  query?: string
  subtitle: string
  title: string
  type: 'media' | 'query'
}

type RecentSearch = Omit<HeaderSuggestion, 'type'>

const recentSearchesStorageKey = 'spotify:web-player:recent-searches'
const recentSearchesLimit = 8

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

const searchTypes: WebPlayerSearchType[] = ['tracks', 'albums', 'playlists']

const categorySuggestions = [
  {
    title: 'Music',
    subtitle: 'Genre',
    image: '/images/browse/browse-music.jpeg',
  },
  {
    title: 'Podcasts',
    subtitle: 'Genre',
    image: '/images/browse/browse-podcasts.jpeg',
  },
  {
    title: 'Live Events',
    subtitle: 'Genre',
    image: '/images/browse/browse-liveevents.jpg',
  },
  {
    title: 'Fitness',
    subtitle: 'Genre',
    image: '/images/browse/browse-fitness.jpeg',
  },
  {
    title: 'Workout Music',
    subtitle: 'Genre',
    image: '/images/browse/browse-fitness.jpeg',
  },
  {
    title: 'Pop',
    subtitle: 'Genre',
    image: '/images/browse/browse-pop.jpeg',
  },
  {
    title: 'Hip-Hop',
    subtitle: 'Genre',
    image: '/images/browse/browse-hiphop.jpeg',
  },
]

export const HeaderSearch = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim())
  const [isFocused, setIsFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const trimmedQuery = query.trim()
  const shouldShowRecentSearches = isFocused && trimmedQuery.length === 0
  const shouldShowSuggestions = isFocused && trimmedQuery.length > 0
  const { data: searchData } = useSearch({
    limit: 4,
    query: debouncedQuery,
    types: searchTypes,
  })

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(trimmedQuery)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [trimmedQuery])

  useEffect(() => {
    const storedValue = window.localStorage.getItem(recentSearchesStorageKey)
    if (!storedValue) return

    try {
      const parsedValue = JSON.parse(storedValue)
      if (Array.isArray(parsedValue)) {
        setRecentSearches(
          parsedValue.filter(isRecentSearch).slice(0, recentSearchesLimit),
        )
      }
    } catch {
      window.localStorage.removeItem(recentSearchesStorageKey)
    }
  }, [])

  const rememberSearch = (search: RecentSearch) => {
    setRecentSearches((currentSearches) => {
      const nextSearches = [
        search,
        ...currentSearches.filter(
          (item) =>
            item.title !== search.title || item.subtitle !== search.subtitle,
        ),
      ].slice(0, recentSearchesLimit)

      window.localStorage.setItem(
        recentSearchesStorageKey,
        JSON.stringify(nextSearches),
      )
      return nextSearches
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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

  const handleRecentSearchClick = (search: RecentSearch) => {
    const nextQuery = search.query ?? search.title
    setQuery(nextQuery)
    rememberSearch(search)
    setIsFocused(false)
    router.push(search.href ?? ROUTES.search(nextQuery))
  }

  const handleSuggestionClick = (suggestion: HeaderSuggestion) => {
    const nextQuery = suggestion.query ?? suggestion.title
    setQuery(nextQuery)
    rememberSearch(suggestion)
    setIsFocused(false)
    router.push(suggestion.href ?? ROUTES.search(nextQuery))
  }

  const querySuggestions: HeaderSuggestion[] = trimmedQuery
    ? [
        `${trimmedQuery} playlist`,
        trimmedQuery,
        `${trimmedQuery} motivation`,
        `${trimmedQuery} playlist 2026`,
      ].map((title) => ({
        query: title,
        subtitle: 'Search',
        title,
        type: 'query',
      }))
    : []
  const categoryMatches: HeaderSuggestion[] = categorySuggestions
    .filter((category) => {
      const title = category.title.toLowerCase()
      const search = trimmedQuery.toLowerCase()

      return (
        title.includes(search) || search.includes(title.replace(' music', ''))
      )
    })
    .slice(0, 2)
    .map((category) => ({
      ...category,
      href: ROUTES.searchCategory(category.title),
      type: 'media',
    }))
  const mediaSuggestions: HeaderSuggestion[] =
    debouncedQuery === trimmedQuery
      ? [
          ...(searchData?.tracks ?? []).slice(0, 3).map((track) => ({
            image: getTrackCoverUrl(track.cover),
            subtitle: `Song • ${track.artistId || 'Unknown artist'}`,
            title: track.title,
            type: 'media' as const,
          })),
          ...(searchData?.playlists ?? []).slice(0, 3).map((playlist) => ({
            href: ROUTES.playlist(playlist.id),
            image: getPlaylistCoverUrl(playlist.cover),
            subtitle: 'Playlist',
            title: playlist.title,
            type: 'media' as const,
          })),
          ...(searchData?.albums ?? []).slice(0, 2).map((album) => ({
            href: ROUTES.album(album.id),
            image: getAlbumCoverUrl(album.cover),
            subtitle: 'Album',
            title: album.title,
            type: 'media' as const,
          })),
        ]
      : []
  const suggestions = [
    ...querySuggestions,
    ...categoryMatches,
    ...mediaSuggestions,
  ].slice(0, 9)

  return (
    <form className="relative w-100" onSubmit={handleSubmit}>
      <SearchIcon
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-subdued z-10"
        height={20}
        width={20}
      />
      <Input
        className="pl-12"
        onBlur={() => setIsFocused(false)}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setIsFocused(true)}
        placeholder="What do you want to play?"
        type="text"
        value={query}
        variant="search"
      />
      <button
        aria-label="Open search page"
        className="pl-2 border-l-2 border-border absolute right-4 top-1/2 transform -translate-y-1/2 hover:opacity-80"
        type="submit"
      >
        <ReviewIcon className="text-text-subdued" height={20} width={20} />
      </button>
      {shouldShowRecentSearches && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-md bg-surface p-3 shadow-2xl custom-scrollbar">
          <div className="px-1 pb-2 text-sm font-bold text-text">
            Recent searches
          </div>
          <div className="space-y-1">
            {recentSearches.map((item) => (
              <button
                className="grid w-full grid-cols-[44px_minmax(0,1fr)] items-center gap-3 rounded px-1 py-1.5 text-left transition-colors hover:bg-surface-hover"
                key={`${item.title}-${item.subtitle}`}
                onClick={() => handleRecentSearchClick(item)}
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
                  <span className="block truncate text-xs text-text-subdued">
                    {item.subtitle}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {shouldShowSuggestions && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-md bg-surface p-3 shadow-2xl custom-scrollbar">
          <div className="space-y-1">
            {suggestions.map((item) => (
              <button
                className="grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded px-1 py-1.5 text-left transition-colors hover:bg-surface-hover"
                key={`${item.type}-${item.title}-${item.subtitle}`}
                onClick={() => handleSuggestionClick(item)}
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
                  <span className="flex size-11 items-center justify-center rounded-full text-white/70">
                    <SearchIcon height={26} width={26} />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-white">
                    {item.title}
                  </span>
                  {item.type === 'media' && (
                    <span className="block truncate text-xs text-white/60">
                      {item.subtitle}
                    </span>
                  )}
                </span>
                {item.type === 'query' && (
                  <span className="text-xs text-white/60">Search</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  )
}
