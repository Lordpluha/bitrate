import Image from 'next/image'
import Link from 'next/link'
import type { SafeUser } from '@/entities/User'
import type {
  SearchAlbumResult,
  SearchPlaylistResult,
  SearchTrackResult,
} from '@/features/Search/api/client'
import { getSearchCategoryMatch } from '@/features/Search/lib/getSearchCategoryMatch'
import { searchFilterTabs } from '@/features/Search/model/search.constants'
import type {
  MediaCardItem,
  SearchResultRow,
} from '@/features/Search/model/types'
import { MediaRow } from '@/features/Search/ui/MediaRow'
import { SearchResultList } from '@/features/Search/ui/SearchResultList'
import { ROUTES } from '@/shared/routes'
import {
  getAlbumCoverUrl,
  getPlaylistCoverUrl,
  getTrackCoverUrl,
  getUserAvatarUrl,
} from '@/shared/utils/mediaUrl'

type SearchResultsProps = {
  albums: SearchAlbumResult[]
  playlists: SearchPlaylistResult[]
  query: string
  tracks: SearchTrackResult[]
  users: SafeUser[]
}

export const SearchResults = ({
  albums,
  playlists,
  query,
  tracks,
  users,
}: SearchResultsProps) => {
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

      {categoryMatch ? (
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
      ) : null}

      {playlistItems.length > 0 ? (
        <MediaRow
          items={playlistItems}
          title={`Jump in: ${categoryMatch?.title ?? query} playlists`}
        />
      ) : null}

      {mixedRows.length > 0 ? <SearchResultList items={mixedRows} /> : null}
    </div>
  )
}
