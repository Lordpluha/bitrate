import type { AlbumResponse } from '@entities/Album'
import { ArtistLink } from '@entities/Artist'
import { CollectionHeader } from '@shared/ui/CollectionHeader'
import { TimeUtils } from '@shared/utils/TimeUtils'

const ALBUM_TYPE_LABEL = {
  ALBUM: 'Album',
  COMPILATION: 'Compilation',
  EP: 'EP',
  SINGLE: 'Single',
} as const satisfies Record<NonNullable<AlbumResponse['type']>, string>

type AlbumHeroProps = {
  album: AlbumResponse
  coverUrl: string
  duration: number
  trackCount: number
}

export const AlbumHero = ({
  album,
  coverUrl,
  duration,
  trackCount,
}: AlbumHeroProps) => (
  <CollectionHeader
    coverUrl={coverUrl}
    description={album.description}
    meta={[
      [
        ...(album.releaseDate
          ? [String(new Date(album.releaseDate).getFullYear())]
          : []),
        `${trackCount} ${trackCount === 1 ? 'song' : 'songs'}`,
      ].join(' · '),
      ...(duration > 0 ? [TimeUtils.formatDuration(duration)] : []),
    ]}
    owner={<ArtistLink artistId={album.artistId} className="hover:underline" />}
    title={album.title}
    type={ALBUM_TYPE_LABEL[album.type ?? 'ALBUM']}
  />
)
