import { LIKED_SONGS_ID } from '@/entities/Playlist'
import { ROUTES } from '@/shared/routes'
import type {
  LibraryPlaylist,
  LibraryViewMode,
} from '@/views/Library/model/library.types'
import { LibraryCollectionGrid } from '@/views/Library/ui/LibraryCollectionGrid'

type PlaylistLibrarySectionProps = {
  playlists: LibraryPlaylist[]
  viewMode: LibraryViewMode
}

export const PlaylistLibrarySection = ({
  playlists,
  viewMode,
}: PlaylistLibrarySectionProps) => (
  <LibraryCollectionGrid
    items={playlists.map((playlist) => {
      const isLikedSongs = playlist.id === LIKED_SONGS_ID

      return {
        cover: playlist.cover,
        href: isLikedSongs ? ROUTES.likedSongs : ROUTES.playlist(playlist.id),
        id: playlist.id,
        playKind: isLikedSongs ? undefined : 'playlist',
        subtitle: [
          'Playlist',
          playlist.username,
          playlist.tracksCount > 0 ? `${playlist.tracksCount} songs` : null,
        ]
          .filter(Boolean)
          .join(' · '),
        title: playlist.title,
      }
    })}
    viewMode={viewMode}
  />
)
