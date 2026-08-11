'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { SafeUser } from '@/entities/User'
import type {
  SearchAlbumResult,
  SearchArtistResult,
  SearchPlaylistResult,
  SearchTrackResult,
} from '@/features/Search/api/client'
import {
  buildSearchRows,
  getAllTabRows,
} from '@/features/Search/lib/buildSearchRows'
import { getSearchCategoryMatch } from '@/features/Search/lib/getSearchCategoryMatch'
import { searchFilterTabs } from '@/features/Search/model/search.constants'
import type { MediaCardItem } from '@/features/Search/model/types'
import { MediaRow } from '@/features/Search/ui/MediaRow'
import {
  type SearchFilterTab,
  SearchFilterTabs,
} from '@/features/Search/ui/SearchFilterTabs'
import { SearchResultList } from '@/features/Search/ui/SearchResultList'
import { ROUTES } from '@/shared/routes'
import { getPlaylistCoverUrl } from '@/shared/utils/mediaUrl'

type SearchResultsProps = {
  albums: SearchAlbumResult[]
  artists: SearchArtistResult[]
  playlists: SearchPlaylistResult[]
  query: string
  tracks: SearchTrackResult[]
  users: SafeUser[]
}

export const SearchResults = ({
  albums,
  artists,
  playlists,
  query,
  tracks,
  users,
}: SearchResultsProps) => {
  const [activeTab, setActiveTab] = useState<SearchFilterTab>('All')
  const categoryMatch = getSearchCategoryMatch(query)

  const groups = useMemo(
    () => buildSearchRows({ albums, artists, playlists, tracks, users }),
    [albums, artists, playlists, tracks, users],
  )

  const availableTabs = useMemo(
    () =>
      searchFilterTabs.filter(
        (tab) => tab === 'All' || (groups[tab]?.length ?? 0) > 0,
      ),
    [groups],
  )

  const rows =
    activeTab === 'All' ? getAllTabRows(groups) : (groups[activeTab] ?? [])

  const playlistItems: MediaCardItem[] = playlists
    .slice(0, 12)
    .map((playlist) => ({
      description: 'Playlist',
      href: ROUTES.playlist(playlist.id),
      image: getPlaylistCoverUrl(playlist.cover),
      title: playlist.title,
    }))

  const showsPlaylistRow = activeTab === 'All' && playlistItems.length > 0

  return (
    <div className="space-y-8">
      <SearchFilterTabs
        activeTab={activeTab}
        availableTabs={[...availableTabs]}
        onTabChange={setActiveTab}
      />

      {categoryMatch && activeTab === 'All' ? (
        <Link
          className="grid max-w-full grid-cols-[72px_minmax(0,1fr)] items-center gap-5 rounded-md bg-surface p-4 transition-colors hover:bg-surface-hover"
          href={ROUTES.searchCategory(categoryMatch.title)}
        >
          <Image
            alt={categoryMatch.title}
            className="size-18 rounded-md object-cover shadow-lg shadow-black/25"
            height={72}
            src={categoryMatch.image}
            unoptimized
            width={72}
          />
          <span className="min-w-0">
            <span className="block truncate text-2xl font-bold text-text sm:text-3xl">
              {categoryMatch.title}
            </span>
            <span className="mt-1 block text-sm text-text-subdued">Genre</span>
          </span>
        </Link>
      ) : null}

      {showsPlaylistRow ? (
        <MediaRow
          items={playlistItems}
          title={`Jump in: ${categoryMatch?.title ?? query} playlists`}
        />
      ) : null}

      {rows.length > 0 ? (
        <SearchResultList items={rows} />
      ) : (
        <p className="text-text-subdued">
          No {activeTab.toLowerCase()} found for &quot;{query}&quot;.
        </p>
      )}
    </div>
  )
}
