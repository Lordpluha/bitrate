'use client'

import { useAlbums } from '@entities/Album'
import { usePlaylists } from '@entities/Playlist'
import { type TrackEntity, useTracks } from '@entities/Track'
import { type SafeUser, useUsers } from '@entities/User'
import {
  useSearch,
  type WebPlayerSearchType,
} from '@features/Search/api/client'
import { ROUTES } from '@shared/routes'
import { MusicCardLg } from '@shared/ui'
import {
  getAlbumCoverUrl,
  getPlaylistCoverUrl,
  getTrackCoverUrl,
  getUserAvatarUrl,
} from '@shared/utils/mediaUrl'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CustomNextIcon,
  CustomPrevIcon,
} from '@spotify/ui-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

type BrowseCategory = {
  color: string
  image: string
  title: string
}

type MediaCardItem = {
  description: string
  href?: string
  image: string
  title: string
}

type SearchResultRow = {
  href?: string
  image: string
  kind: string
  subtitle: string
  title: string
}

const searchTypes: WebPlayerSearchType[] = ['tracks', 'albums', 'playlists']

const browseImages = [
  '/images/browse/browse-music.jpeg',
  '/images/browse/browse-podcasts.jpeg',
  '/images/browse/browse-liveevents.jpg',
  '/images/browse/browse-fitness.jpeg',
  '/images/browse/browse-foryou.jpeg',
  '/images/browse/browse-newrealease.jpeg',
  '/images/browse/browse-pop.jpeg',
  '/images/browse/browse-hiphop.jpeg',
] as const

const browseColors = [
  '#dc148c',
  '#006450',
  '#8400e7',
  '#777777',
  '#1e3264',
  '#608108',
  '#477d95',
  '#477d95',
  '#006450',
  '#e1338b',
  '#8d67ab',
  '#477d95',
  '#e1338b',
  '#af2896',
  '#dc148c',
  '#477d95',
  '#b06239',
  '#e03131',
  '#777777',
  '#8d67ab',
  '#b06216',
  '#b06216',
  '#e03131',
  '#3273dc',
] as const

const browseCategoryTitles = [
  'Music',
  'Podcasts',
  'Live Events',
  'Fitness',
  'Made For You',
  'New Releases',
  'Pop',
  'Hip-Hop',
  'Rock',
  'Mood',
  'Charts',
  'Comedy',
  'Educational',
  'True Crime',
  'Sports',
  'Dance / Electronic',
  'Chill',
  'Indie',
  'Workout Music',
  'Discover',
  'Folk & Acoustic',
  'R&B',
  'K-pop',
  'Latin',
  'Sleep',
  'Party',
  'At Home',
  'Decades',
  'Love',
  'Metal',
  'Jazz',
  'Trending',
  'Classical',
  'Country',
  'Focus',
  'Soul',
  'Kids & Family',
  'Gaming',
  'Anime',
  'TV & Movies',
  'Instrumental',
  'Wellness',
  'Punk',
  'Ambient',
  'Blues',
  'Cooking & Dining',
  'Alternative',
  'Travel',
  'Caribbean',
  'Afro',
  'Songwriters',
  'Nature & Noise',
  'Funk & Disco',
  'GLOW',
  'Spotify Singles',
  'Netflix',
  'Summer',
  'RADAR',
  'EQUAL',
  'Fresh Finds',
  'Mixed By',
] as const

const searchFilterTabs = [
  'All',
  'Playlists',
  'Songs',
  'Genres & Moods',
  'Albums',
  'Profiles',
  'Artists',
  'Podcasts & Shows',
] as const

const browseCategories: BrowseCategory[] = browseCategoryTitles.map(
  (title, index) => ({
    color: browseColors[index % browseColors.length] ?? '#477d95',
    image: browseImages[index % browseImages.length] ?? browseImages[0],
    title,
  }),
)

const getSearchCategoryMatch = (query: string) => {
  const normalizedQuery = query.toLowerCase()

  return browseCategories.find((category) => {
    const normalizedTitle = category.title.toLowerCase()

    return (
      normalizedTitle.includes(normalizedQuery) ||
      normalizedQuery.includes(normalizedTitle.replace(' music', ''))
    )
  })
}

const mockCategoryRows: Record<string, string[]> = {
  'Live Events': [
    'Concerts near you',
    'Electronic nights',
    'Festival season',
    'Indie stages',
    'Pop live',
  ],
  Podcasts: [
    'Comedy',
    'Educational',
    'True Crime',
    'Sports',
    'Stories',
    'Music',
    'Arts & Entertainment',
  ],
  Fitness: [
    'Workout hits',
    'Running',
    'Yoga',
    'Beast mode',
    'Cardio',
    'Morning energy',
  ],
}

export const SearchPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const categoryTitle = searchParams.get('category')?.trim() ?? ''
  const category = browseCategories.find(
    (item) => item.title.toLowerCase() === categoryTitle.toLowerCase(),
  )
  const { data, isFetching } = useSearch({
    limit: 8,
    query,
    types: searchTypes,
  })
  const { data: usersData, isFetching: areUsersFetching } = useUsers({
    limit: 4,
    username: query,
  })

  const tracks = data?.tracks ?? []
  const albums = data?.albums ?? []
  const playlists = data?.playlists ?? []
  const usersResponse = usersData as unknown
  const users = Array.isArray(usersResponse)
    ? (usersResponse as SafeUser[])
    : []
  const hasQuery = query.length > 0
  const hasResults =
    tracks.length > 0 ||
    albums.length > 0 ||
    playlists.length > 0 ||
    users.length > 0

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      {category && !hasQuery ? (
        <CategoryPage category={category} />
      ) : (
        <div className="px-6 py-14">
          <div className="mx-auto w-full max-w-[1200px]">
            {hasQuery ? (
              isFetching || areUsersFetching ? (
                <div className="text-text-subdued">Searching...</div>
              ) : !hasResults ? (
                <div>
                  <h1 className="text-2xl font-bold text-text">
                    No results found for "{query}"
                  </h1>
                  <p className="mt-2 text-text-subdued">
                    Please make sure your words are spelled correctly, or use
                    fewer or different keywords.
                  </p>
                </div>
              ) : (
                <SearchResults
                  albums={albums}
                  playlists={playlists}
                  query={query}
                  tracks={tracks}
                  users={users}
                />
              )
            ) : (
              <>
                <h1 className="mb-5 text-2xl font-bold text-text">
                  Browse all
                </h1>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-5">
                  {browseCategories.map((item) => (
                    <button
                      className="group relative h-[160px] overflow-hidden rounded-lg p-4 text-left text-2xl font-bold text-white transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      key={item.title}
                      onClick={() =>
                        router.push(ROUTES.searchCategory(item.title))
                      }
                      style={{ backgroundColor: item.color }}
                      type="button"
                    >
                      <span className="absolute left-4 top-4 z-10 block max-w-[72%] leading-tight">
                        {item.title}
                      </span>
                      <Image
                        alt=""
                        className="absolute -right-6 bottom-0 size-30 rotate-[25deg] rounded-lg overflow-hidden object-cover shadow-xl transition-transform group-hover:scale-105"
                        height={96}
                        src={item.image}
                        unoptimized
                        width={96}
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const CategoryPage = ({ category }: { category: BrowseCategory }) => {
  const { data: albums = [] } = useAlbums({ limit: 12 })
  const { data: playlistsData } = usePlaylists(1, 12)
  const { data: tracksData } = useTracks({ limit: 12 })
  const categoryMatches = mockCategoryRows[category.title] ?? []
  const playlists = Array.isArray(playlistsData) ? playlistsData : []
  const tracks = Array.isArray(tracksData) ? (tracksData as TrackEntity[]) : []

  const playlistItems: MediaCardItem[] = playlists
    .slice(0, 8)
    .map((playlist) => ({
      description: playlist.description || 'Playlist',
      href: ROUTES.playlist(playlist.id),
      image: getPlaylistCoverUrl(playlist.cover),
      title: playlist.title,
    }))
  const albumItems: MediaCardItem[] = albums.slice(0, 8).map((album) => ({
    description: 'Album',
    href: ROUTES.album(album.id),
    image: getAlbumCoverUrl(album.cover),
    title: album.title,
  }))
  const trackItems: MediaCardItem[] = tracks.slice(0, 8).map((track) => ({
    description: track.artistId || 'Track',
    image: getTrackCoverUrl(track.cover),
    title: track.title,
  }))
  const mockItems: MediaCardItem[] = categoryMatches.map((title, index) => ({
    description: getMockDescription(category.title, title),
    image: browseImages[index % browseImages.length] ?? browseImages[0],
    title,
  }))
  const categoryGrid =
    mockItems.length > 0
      ? mockItems
      : browseCategories
          .filter((item) => item.title !== category.title)
          .slice(0, 12)
          .map((item) => ({
            description: 'Browse category',
            href: ROUTES.searchCategory(item.title),
            image: item.image,
            title: item.title,
          }))

  return (
    <div
      className="min-h-full bg-background-secondary"
      style={{
        background: `linear-gradient(180deg, ${category.color} 0px, ${category.color} 160px, ${category.color}cc 260px, rgba(18,18,18,0.96) 390px, #121212 520px)`,
      }}
    >
      <section className="flex min-h-[300px] items-end px-6 pb-10 pt-24">
        <div className="mx-auto w-full max-w-[1160px]">
          <h1 className="text-6xl font-black tracking-normal text-white md:text-7xl">
            {category.title}
          </h1>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1160px] space-y-10 px-6 py-8">
        <MediaRow
          items={categoryGrid}
          title={category.title === 'Podcasts' ? 'Categories' : 'Browse all'}
        />
        <MediaRow items={albumItems} title="Discover new music" />
        <MediaRow items={playlistItems} title="Playlists from our editors" />
        <MediaRow items={trackItems} title="Hand-picked new releases" />
        <MediaRow
          items={buildMockMixes(category.title)}
          title="Uniquely yours"
        />
        <MediaRow items={buildMockCharts()} title="Featured Charts" />
        <MediaRow
          items={buildMockDailyMixes(category.title)}
          title="Your Daily Mixes"
        />
        <MediaRow
          items={playlistItems}
          title={`Popular ${category.title} playlists`}
        />
        <MediaRow items={buildMockArtistMixes()} title="Your Artist Mixes" />
      </div>
    </div>
  )
}

const MediaRow = ({
  items,
  title,
}: {
  items: MediaCardItem[]
  title: string
}) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const updateCarouselState = useCallback((api: CarouselApi | undefined) => {
    setCanScrollPrev(!!api?.canScrollPrev())
    setCanScrollNext(!!api?.canScrollNext())
  }, [])

  useEffect(() => {
    if (!carouselApi) return

    updateCarouselState(carouselApi)
    carouselApi.on('select', updateCarouselState)
    carouselApi.on('reInit', updateCarouselState)

    return () => {
      carouselApi.off('select', updateCarouselState)
      carouselApi.off('reInit', updateCarouselState)
    }
  }, [carouselApi, updateCarouselState])

  if (items.length === 0) return null

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-text">{title}</h2>
        {items.length > 5 && (
          <span className="text-xs font-bold uppercase text-text-subdued">
            Show all
          </span>
        )}
      </div>
      <div className="group relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[164px] md:h-[178px]">
          {canScrollPrev && (
            <button
              aria-label={`Previous ${title}`}
              className="pointer-events-auto absolute left-0 top-1/2 flex h-8 w-8 -translate-x-3 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-lg transition-opacity hover:scale-105 group-hover:opacity-100"
              onClick={() => carouselApi?.scrollPrev()}
              type="button"
            >
              <CustomPrevIcon className="h-5 w-5" />
            </button>
          )}
          {canScrollNext && (
            <button
              aria-label={`Next ${title}`}
              className="pointer-events-auto absolute right-0 top-1/2 flex h-8 w-8 translate-x-3 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-lg transition-opacity hover:scale-105 group-hover:opacity-100"
              onClick={() => carouselApi?.scrollNext()}
              type="button"
            >
              <CustomNextIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        <Carousel
          className="w-full"
          opts={{ align: 'start' }}
          setApi={setCarouselApi}
          showNavigation={false}
          slidesToShow={6}
        >
          <CarouselContent className="flex">
            {items.slice(0, 12).map((item) => (
              <CarouselItem
                className="mr-4 basis-[164px] shrink-0 md:basis-[178px]"
                key={`${title}-${item.title}`}
              >
                <MusicCardLg
                  description={item.description}
                  href={item.href}
                  id={item.href ?? item.title}
                  imageUrl={item.image}
                  name={item.title}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}

const SearchResults = ({
  albums,
  playlists,
  query,
  tracks,
  users,
}: {
  albums: Array<{
    cover?: string | null
    id: string
    title: string
  }>
  playlists: Array<{
    cover?: string | null
    id: string
    title: string
  }>
  query: string
  tracks: Array<{
    artistId?: string | null
    cover?: string | null
    id: string
    title: string
  }>
  users: SafeUser[]
}) => {
  const categoryMatch = getSearchCategoryMatch(query)
  const playlistItems: MediaCardItem[] = playlists
    .slice(0, 12)
    .map((playlist) => ({
      description: 'By Spotify',
      href: ROUTES.playlist(playlist.id),
      image: getPlaylistCoverUrl(playlist.cover),
      title: playlist.title,
    }))
  const mixedRows: SearchResultRow[] = [
    ...playlists.slice(0, 4).map((playlist) => ({
      href: ROUTES.playlist(playlist.id),
      image: getPlaylistCoverUrl(playlist.cover),
      kind: 'Playlist',
      subtitle: 'Playlist',
      title: playlist.title,
    })),
    ...tracks.slice(0, 4).map((track) => ({
      image: getTrackCoverUrl(track.cover),
      kind: 'Song',
      subtitle: track.artistId || 'Song',
      title: track.title,
    })),
    ...albums.slice(0, 4).map((album) => ({
      href: ROUTES.album(album.id),
      image: getAlbumCoverUrl(album.cover),
      kind: 'Album',
      subtitle: 'Album',
      title: album.title,
    })),
    ...users.slice(0, 4).map((user) => ({
      href: ROUTES.user(user.id),
      image: getUserAvatarUrl(user.avatar),
      kind: 'Profile',
      subtitle: 'Profile',
      title: user.username,
    })),
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {searchFilterTabs.map((tab) => (
          <button
            className={
              tab === 'All'
                ? 'rounded-full bg-white px-4 py-2 text-sm font-medium text-black'
                : 'rounded-full bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-surface-hover'
            }
            key={tab}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {categoryMatch && (
        <Link
          className="grid max-w-full grid-cols-[72px_minmax(0,1fr)] items-center gap-5 rounded-md bg-surface p-4 transition-colors hover:bg-surface-hover"
          href={ROUTES.searchCategory(categoryMatch.title)}
        >
          <Image
            alt={categoryMatch.title}
            className="size-[72px] rounded-md object-cover shadow-lg shadow-black/25"
            height={72}
            src={categoryMatch.image}
            unoptimized
            width={72}
          />
          <span className="min-w-0">
            <span className="block truncate text-3xl font-bold text-text">
              {categoryMatch.title}
            </span>
            <span className="mt-1 block text-sm text-text-subdued">Genre</span>
          </span>
        </Link>
      )}

      {playlistItems.length > 0 && (
        <MediaRow
          items={playlistItems}
          title={`Jump in: ${categoryMatch?.title ?? query} playlists`}
        />
      )}

      {mixedRows.length > 0 && (
        <section>
          <div className="space-y-1">
            {mixedRows.map((item) => {
              const content = (
                <>
                  <Image
                    alt={item.title}
                    className="size-16 rounded object-cover"
                    height={64}
                    src={item.image}
                    unoptimized
                    width={64}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-base font-medium text-text">
                      {item.title}
                    </span>
                    <span className="block truncate text-sm text-text-subdued">
                      {item.subtitle}
                    </span>
                  </span>
                  <span className="justify-self-end rounded bg-white/10 px-2 py-1 text-xs font-bold text-text-subdued">
                    {item.kind}
                  </span>
                </>
              )

              if (item.href) {
                return (
                  <Link
                    className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 rounded-md p-2 transition-colors hover:bg-surface"
                    href={item.href}
                    key={`${item.kind}-${item.title}`}
                  >
                    {content}
                  </Link>
                )
              }

              return (
                <div
                  className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 rounded-md p-2 transition-colors hover:bg-surface"
                  key={`${item.kind}-${item.title}`}
                >
                  {content}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

const getMockDescription = (category: string, title: string) => {
  if (category === 'Podcasts') return `${title} shows and episodes`
  if (category === 'Live Events')
    return `${title} picks for your next night out`
  return `${title} music picked for this category`
}

const buildMockMixes = (category: string): MediaCardItem[] => [
  {
    description: `Songs you keep coming back to in ${category}`,
    image: browseImages[4],
    title: 'On Repeat',
  },
  {
    description: 'Your past favorites, refreshed',
    image: browseImages[5],
    title: 'Repeat Rewind',
  },
  {
    description: `A daily mix shaped around ${category}`,
    image: browseImages[6],
    title: 'Daily Mix 01',
  },
]

const buildMockCharts = (): MediaCardItem[] => [
  {
    description: 'Your weekly update of the most played tracks',
    image: browseImages[5],
    title: 'Top Songs Global',
  },
  {
    description: 'The biggest tracks in your region right now',
    image: browseImages[6],
    title: 'Top Songs Ukraine',
  },
  {
    description: 'Daily global chart from listeners',
    image: browseImages[0],
    title: 'Top 50 Global',
  },
  {
    description: 'Daily local chart from listeners',
    image: browseImages[1],
    title: 'Top 50 Ukraine',
  },
]

const buildMockDailyMixes = (category: string): MediaCardItem[] =>
  Array.from({ length: 6 }, (_, index) => ({
    description: `${category}, favorites and similar picks`,
    image: browseImages[index % browseImages.length] ?? browseImages[0],
    title: `Daily Mix ${index + 1}`,
  }))

const buildMockArtistMixes = (): MediaCardItem[] =>
  [
    'Eminem Mix',
    'NUEKI Mix',
    'Shiro SAGISU Mix',
    'Willix Mix',
    'LXNGVX Mix',
    'KUTE Mix',
  ].map((title, index) => ({
    description: 'Made from your listening style',
    image: browseImages[(index + 2) % browseImages.length] ?? browseImages[0],
    title,
  }))
