import { cn } from '@spotify/ui-react'
import Image from 'next/image'
import Link from 'next/link'
import { ROUTES } from '@/shared/routes'
import { getAlbumCoverUrl } from '@/shared/utils/mediaUrl'
import type {
  LibraryAlbum,
  LibraryViewMode,
} from '@/views/Library/model/library.types'
import { LibraryGridEmptyAware } from '@/views/Library/ui/LibraryEmptyAware'

type AlbumLibrarySectionProps = {
  albums: LibraryAlbum[]
  viewMode: LibraryViewMode
}

export const AlbumLibrarySection = ({
  albums,
  viewMode,
}: AlbumLibrarySectionProps) => (
  <LibraryGridEmptyAware
    className={cn(
      viewMode === 'grid' && 'grid-cols-2 gap-3',
      'xl:grid-cols-[repeat(auto-fill,minmax(min(100%,150px),1fr))] xl:gap-4',
    )}
    isEmpty={albums.length === 0}
  >
    {albums.map((album) => (
      <Link
        className={cn(
          'min-w-0 rounded-lg transition-colors hover:bg-surface',
          viewMode === 'list'
            ? 'flex items-center gap-3 px-1 py-2'
            : 'block p-2',
          'xl:block xl:p-3',
        )}
        href={ROUTES.album(album.id)}
        key={album.id}
      >
        <Image
          alt={album.title}
          className={cn(
            'shrink-0 rounded-sm object-cover',
            viewMode === 'list' ? 'size-16' : 'aspect-square w-full',
            'xl:aspect-square xl:h-auto xl:w-full',
          )}
          height={180}
          src={getAlbumCoverUrl(album.cover)}
          unoptimized
          width={180}
        />
        <span className="min-w-0">
          <span className="block truncate text-base font-medium text-text xl:mt-3 xl:text-sm">
            {album.title}
          </span>
          <span className="block truncate text-sm text-text-subdued xl:text-xs">
            Album
          </span>
        </span>
      </Link>
    ))}
  </LibraryGridEmptyAware>
)
