import { LIKED_SONGS_ID } from '@/entities/Playlist'
import { useI18n } from '@/shared/i18n'
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
}: PlaylistLibrarySectionProps) => {
  const { t, tp } = useI18n()

  return (
    <LibraryCollectionGrid
      items={playlists.map((playlist) => {
        const isLikedSongs = playlist.id === LIKED_SONGS_ID

        return {
          cover: playlist.cover,
          href: isLikedSongs ? ROUTES.likedSongs : ROUTES.playlist(playlist.id),
          id: playlist.id,
          playKind: isLikedSongs ? undefined : 'playlist',
          subtitle: [
            t('common.playlist'),
            playlist.username,
            playlist.tracksCount > 0
              ? tp({ count: playlist.tracksCount, key: 'common.songs' })
              : null,
          ]
            .filter(Boolean)
            .join(' · '),
          title: playlist.title,
        }
      })}
      viewMode={viewMode}
    />
  )
}
