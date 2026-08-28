import { cn } from '@spotify/ui-react'
import Image from 'next/image'
import Link from 'next/link'
import { ROUTES } from '@/shared/routes'
import type {
  LibraryPlaylist,
  LibraryViewMode,
} from '@/views/Library/model/library.types'
import { LibraryGridEmptyAware } from '@/views/Library/ui/LibraryEmptyAware'

type PlaylistLibrarySectionProps = {
  playlists: LibraryPlaylist[]
  viewMode: LibraryViewMode
}

export const PlaylistLibrarySection = ({
  playlists,
  viewMode,
}: PlaylistLibrarySectionProps) => (
  <LibraryGridEmptyAware
    className={cn(
      viewMode === 'grid' && 'grid-cols-2 gap-3',
      'xl:grid-cols-[repeat(auto-fill,minmax(min(100%,150px),1fr))] xl:gap-4',
    )}
    isEmpty={playlists.length === 0}
  >
    {playlists.map((playlist) => {
      const isLikedSongs = playlist.id === 'liked-songs'
      const href = isLikedSongs
        ? ROUTES.likedSongs
        : ROUTES.playlist(playlist.id)

      return (
        <Link
          className={cn(
            'min-w-0 rounded-lg transition-colors hover:bg-surface',
            viewMode === 'list'
              ? 'flex items-center gap-3 px-1 py-2'
              : 'block p-2',
            'xl:block xl:p-3',
          )}
          href={href}
          key={playlist.id}
        >
          <Image
            alt={playlist.title}
            className={cn(
              'shrink-0 rounded-sm object-cover',
              viewMode === 'list' ? 'size-16' : 'aspect-square w-full',
              'xl:aspect-square xl:h-auto xl:w-full',
            )}
            height={180}
            src={playlist.cover}
            unoptimized
            width={180}
          />
          <span className="min-w-0">
            <span
              className={cn(
                'block truncate text-base font-medium xl:mt-3 xl:text-sm',
                isLikedSongs ? 'text-success' : 'text-text',
              )}
            >
              {playlist.title}
            </span>
            <span className="block truncate text-sm text-text-subdued xl:text-xs">
              Playlist • {playlist.username}
              {playlist.tracksCount > 0
                ? ` • ${playlist.tracksCount} tracks`
                : ''}
            </span>
          </span>
        </Link>
      )
    })}
  </LibraryGridEmptyAware>
)
