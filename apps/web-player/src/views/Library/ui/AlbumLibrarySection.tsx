import { ROUTES } from '@/shared/routes'
import { getAlbumCoverUrl } from '@/shared/utils/mediaUrl'
import type {
  LibraryAlbum,
  LibraryViewMode,
} from '@/views/Library/model/library.types'
import { LibraryCollectionGrid } from '@/views/Library/ui/LibraryCollectionGrid'

type AlbumLibrarySectionProps = {
  albums: LibraryAlbum[]
  viewMode: LibraryViewMode
}

export const AlbumLibrarySection = ({
  albums,
  viewMode,
}: AlbumLibrarySectionProps) => (
  <LibraryCollectionGrid
    items={albums.map((album) => ({
      cover: getAlbumCoverUrl(album.cover),
      href: ROUTES.album(album.id),
      id: album.id,
      playKind: 'album',
      subtitle: 'Album',
      title: album.title,
    }))}
    viewMode={viewMode}
  />
)
