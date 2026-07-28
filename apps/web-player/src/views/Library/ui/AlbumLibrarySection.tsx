import Image from 'next/image'
import Link from 'next/link'
import { ROUTES } from '@/shared/routes'
import { getAlbumCoverUrl } from '@/shared/utils/mediaUrl'
import type { LibraryAlbum } from '@/views/Library/model/library.types'
import { LibraryGridEmptyAware } from '@/views/Library/ui/LibraryEmptyAware'

type AlbumLibrarySectionProps = {
  albums: LibraryAlbum[]
}

export const AlbumLibrarySection = ({ albums }: AlbumLibrarySectionProps) => (
  <LibraryGridEmptyAware isEmpty={albums.length === 0}>
    {albums.map((album) => (
      <Link
        className="rounded-lg p-3 transition-colors hover:bg-surface"
        href={ROUTES.album(album.id)}
        key={album.id}
      >
        <Image
          alt={album.title}
          className="aspect-square w-full rounded-md object-cover"
          height={180}
          src={getAlbumCoverUrl(album.cover)}
          unoptimized
          width={180}
        />
        <h2 className="mt-3 truncate text-sm font-medium text-text">
          {album.title}
        </h2>
        <p className="truncate text-xs text-text-subdued">Album</p>
      </Link>
    ))}
  </LibraryGridEmptyAware>
)
