import type { AlbumResponse } from '@entities/Album'
import { ArtistLink } from '@entities/Artist'
import { type TranslationKey, useI18n } from '@shared/i18n'
import { CollectionHeader } from '@shared/ui/CollectionHeader'
import { formatTotalDuration } from '@shared/utils/TimeUtils'

const ALBUM_TYPE_LABEL = {
  ALBUM: 'album.type.album',
  COMPILATION: 'album.type.compilation',
  EP: 'album.type.ep',
  SINGLE: 'album.type.single',
} as const satisfies Record<NonNullable<AlbumResponse['type']>, TranslationKey>

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
}: AlbumHeroProps) => {
  const { t, tp } = useI18n()

  return (
    <CollectionHeader
      coverUrl={coverUrl}
      description={album.description}
      meta={[
        [
          ...(album.releaseDate
            ? [String(new Date(album.releaseDate).getFullYear())]
            : []),
          tp({ count: trackCount, key: 'common.songs' }),
        ].join(' · '),
        ...(duration > 0 ? [formatTotalDuration({ duration, t })] : []),
      ]}
      owner={
        <ArtistLink artistId={album.artistId} className="hover:underline" />
      }
      title={album.title}
      type={t(ALBUM_TYPE_LABEL[album.type ?? 'ALBUM'])}
    />
  )
}
