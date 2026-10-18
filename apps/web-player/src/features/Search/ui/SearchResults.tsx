'use client'

import { MediaImage } from '@shared/ui/MediaImage'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useBrowseCategories } from '@/entities/Discovery'
import type { SafeUser } from '@/entities/User'
import type {
  SearchAlbumResult,
  SearchArtistResult,
  SearchPlaylistResult,
  SearchTrackResult,
} from '@/features/Search/api/client'
import type { SearchResult } from '@/features/Search/api/client/search.schemas'
import {
  buildSearchRows,
  getAllTabRows,
} from '@/features/Search/lib/buildSearchRows'
import { matchBrowseCategory } from '@/features/Search/lib/getSearchCategoryMatch'
import { toTopResultCard } from '@/features/Search/lib/topResultCard'
import { searchFilterTabs } from '@/features/Search/model/search.constants'
import type { MediaCardItem } from '@/features/Search/model/types'
import { MediaRow } from '@/features/Search/ui/MediaRow'
import {
  type SearchFilterTab,
  SearchFilterTabs,
} from '@/features/Search/ui/SearchFilterTabs'
import { SearchResultList } from '@/features/Search/ui/SearchResultList'
import { SearchSongs } from '@/features/Search/ui/SearchSongs'
import { SearchTopResult } from '@/features/Search/ui/SearchTopResult'
import { ROUTES } from '@/shared/routes'
import { getPlaylistCoverUrl } from '@/shared/utils/mediaUrl'

type SearchResultsProps = {
  albums: SearchAlbumResult[]
  artists: SearchArtistResult[]
  playlists: SearchPlaylistResult[]
  query: string
  onPlayItem?: (item: MediaCardItem) => void
  /** The API's highest-ranked result across every type. */
  topResult?: SearchResult | null
  tracks: SearchTrackResult[]
  users: SafeUser[]
}

export const SearchResults = ({
  albums,
  artists,
  onPlayItem,
  playlists,
  query,
  topResult = null,
  tracks,
  users,
}: SearchResultsProps) => {
  const [activeTab, setActiveTab] = useState<SearchFilterTab>('All')
  const { data: categoryData } = useBrowseCategories()
  const categoryMatch = matchBrowseCategory({
    query,
    categories: categoryData?.data ?? [],
  })

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

  const isAllTab = activeTab === 'All'
  const topCard = topResult ? toTopResultCard(topResult) : null
  /* the All tab shows songs beside the top result, so its list leaves them out */
  const rows = isAllTab
    ? getAllTabRows(groups).filter(
        (row) =>
          row.kind !== 'Song' &&
          !(row.kind === 'Playlist' && playlists.length > 0),
      )
    : (groups[activeTab] ?? [])
  const play = (item: Pick<MediaCardItem, 'id' | 'playKind' | 'title'>) =>
    onPlayItem?.({ description: '', image: '', ...item })

  const playlistItems: MediaCardItem[] = playlists
    .slice(0, 12)
    .map((playlist) => ({
      description: 'Playlist',
      href: ROUTES.playlist(playlist.id),
      id: playlist.id,
      image: getPlaylistCoverUrl(playlist.cover),
      playKind: 'playlist' as const,
      title: playlist.title,
    }))

  const showsPlaylistRow = activeTab === 'All' && playlistItems.length > 0

  return (
    <div className="flex flex-col gap-7">
      <SearchFilterTabs
        activeTab={activeTab}
        availableTabs={[...availableTabs]}
        onTabChange={setActiveTab}
      />

      {categoryMatch && activeTab === 'All' ? (
        <Link
          className="grid max-w-full grid-cols-[72px_minmax(0,1fr)] items-center gap-5 rounded-[14px] border border-border bg-card p-4 transition-colors hover:bg-secondary"
          href={ROUTES.searchCategory(categoryMatch.slug)}
        >
          <MediaImage
            alt={categoryMatch.name}
            className="size-18 rounded-md object-cover shadow-lg shadow-black/25"
            fallback="playlist"
            height={72}
            src={getPlaylistCoverUrl(categoryMatch.cover)}
            style={{
              backgroundColor: categoryMatch.color ?? 'var(--color-surface)',
            }}
            unoptimized
            width={72}
          />
          <span className="min-w-0">
            <span className="block truncate font-[family-name:var(--font-landing-display)] text-2xl font-semibold text-foreground">
              {categoryMatch.name}
            </span>
            <span className="mt-1 block text-[13px] text-muted-foreground">
              Genre
            </span>
          </span>
        </Link>
      ) : null}

      {isAllTab && (topCard || tracks.length > 0) ? (
        <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          {topCard ? (
            <SearchTopResult
              card={topCard}
              onPlay={
                topCard.playKind && onPlayItem ? () => play(topCard) : undefined
              }
            />
          ) : null}
          {tracks.length > 0 ? (
            <SearchSongs
              onPlay={
                onPlayItem
                  ? (track) =>
                      play({
                        id: track.id,
                        playKind: 'track',
                        title: track.title,
                      })
                  : undefined
              }
              tracks={tracks}
            />
          ) : null}
        </div>
      ) : null}

      {showsPlaylistRow ? (
        <MediaRow
          items={playlistItems}
          onPlayItem={onPlayItem}
          title={`Jump in: ${categoryMatch?.name ?? query} playlists`}
        />
      ) : null}

      {rows.length > 0 ? (
        <SearchResultList
          items={rows}
          onPlayRow={
            onPlayItem
              ? (row) =>
                  play({ id: row.id, playKind: 'track', title: row.title })
              : undefined
          }
        />
      ) : isAllTab ? null : (
        <p className="text-muted-foreground">
          No {activeTab.toLowerCase()} found for &quot;{query}&quot;.
        </p>
      )}
    </div>
  )
}
