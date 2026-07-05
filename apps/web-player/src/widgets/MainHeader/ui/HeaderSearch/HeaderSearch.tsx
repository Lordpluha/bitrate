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

const recentSearches = [
  {
    title: 'Drive',
    subtitle: 'Playlist • Grant Combe',
    image: '/images/drive-cover.jpg',
  },
  {
    title: 'Nightcall',
    subtitle: 'Song • Kavinsky',
    image: '/images/drive-cover-big.jpg',
  },
  {
    title: 'Bleach Soundtracks',
    subtitle: 'Playlist • T karolina',
    image: '/images/default-playlist.jpg',
  },
  {
    title: 'WHAT CAN I SAY',
    subtitle: 'Album • 7vvch',
    image: '/images/what-can-i-say.jpg',
  },
  {
    title: 'Liked Songs',
    subtitle: 'Playlist',
    image: '/images/liked-songs.jpg',
  },
  {
    title: 'Michael Jackson',
    subtitle: 'Artist',
    image: '/images/michael-jackson-1.jpg',
  },
  {
    title: 'Pop Mix',
    subtitle: 'Playlist',
    image: '/images/spotify-music-1.png',
  },
  {
    title: 'Daily Mix',
    subtitle: 'Playlist',
    image: '/images/spotify-music-2.png',
  },
]

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
  const [isFocused, setIsFocused] = useState(false)
  const trimmedQuery = query.trim()
  const shouldShowRecentSearches = isFocused && trimmedQuery.length === 0
  const shouldShowSuggestions = isFocused && trimmedQuery.length > 0
  const { data: searchData } = useSearch({
    limit: 4,
    query: trimmedQuery,
    types: searchTypes,
  })

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsFocused(false)
    router.push(ROUTES.search(query.trim()))
  }

  const handleRecentSearchClick = (title: string) => {
    setQuery(title)
    setIsFocused(false)
    router.push(ROUTES.search(title))
  }

  const handleSuggestionClick = (suggestion: HeaderSuggestion) => {
    const nextQuery = suggestion.query ?? suggestion.title
    setQuery(nextQuery)
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
  const mediaSuggestions: HeaderSuggestion[] = [
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
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-md bg-[#282828] p-3 shadow-2xl custom-scrollbar">
          <div className="px-1 pb-2 text-sm font-bold text-white">
            Recent searches
          </div>
          <div className="space-y-1">
            {recentSearches.map((item) => (
              <button
                className="grid w-full grid-cols-[44px_minmax(0,1fr)] items-center gap-3 rounded px-1 py-1.5 text-left transition-colors hover:bg-white/10"
                key={`${item.title}-${item.subtitle}`}
                onClick={() => handleRecentSearchClick(item.title)}
                onMouseDown={(event) => event.preventDefault()}
                type="button"
              >
                <Image
                  alt={item.title}
                  className="size-11 rounded object-cover"
                  height={44}
                  src={item.image}
                  unoptimized
                  width={44}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-white">
                    {item.title}
                  </span>
                  <span className="block truncate text-xs text-white/60">
                    {item.subtitle}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {shouldShowSuggestions && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-md bg-[#282828] p-3 shadow-2xl custom-scrollbar">
          <div className="space-y-1">
            {suggestions.map((item) => (
              <button
                className="grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded px-1 py-1.5 text-left transition-colors hover:bg-white/10"
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
