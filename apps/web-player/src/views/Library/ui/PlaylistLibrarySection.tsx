import Image from 'next/image'
import Link from 'next/link'
import { ROUTES } from '@/shared/routes'
import { getPlaylistCoverUrl } from '@/shared/utils/mediaUrl'
import type { LibraryPlaylist } from '@/views/Library/model/library.types'
import { LibraryGridEmptyAware } from '@/views/Library/ui/LibraryEmptyAware'

type PlaylistLibrarySectionProps = {
  playlists: LibraryPlaylist[]
}

export const PlaylistLibrarySection = ({
  playlists,
}: PlaylistLibrarySectionProps) => (
  <LibraryGridEmptyAware isEmpty={playlists.length === 0}>
    {playlists.map((playlist) => (
      <Link
        className="rounded-lg p-3 transition-colors hover:bg-surface"
        href={ROUTES.playlist(playlist.id)}
        key={playlist.id}
      >
        <Image
          alt={playlist.title}
          className="aspect-square w-full rounded-md object-cover"
          height={180}
          src={getPlaylistCoverUrl(playlist.cover)}
          unoptimized
          width={180}
        />
        <h2 className="mt-3 truncate text-sm font-medium text-text">
          {playlist.title}
        </h2>
        <p className="truncate text-xs text-text-subdued">
          {playlist.tracks?.length ?? 0} tracks
        </p>
      </Link>
    ))}
  </LibraryGridEmptyAware>
)
