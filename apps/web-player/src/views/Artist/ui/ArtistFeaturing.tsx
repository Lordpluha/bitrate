'use client'

import { useArtistPlaylists } from '@entities/Discovery'
import { ROUTES } from '@shared/routes'
import { MusicCardLg } from '@shared/ui'
import { getPlaylistCoverUrl } from '@shared/utils/mediaUrl'
import { usePlayCollection } from '@/features/PlayCollection'
import { useI18n } from '@/shared/i18n'

type ArtistFeaturingProps = {
  artistId: string
  artistName: string
}

/** Public playlists people made that feature the artist; hidden when there are none. */
export const ArtistFeaturing = ({
  artistId,
  artistName,
}: ArtistFeaturingProps) => {
  const { t } = useI18n()
  const { data } = useArtistPlaylists(artistId)
  const playlists = data?.data ?? []
  const playCollection = usePlayCollection()
  if (playlists.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[19px] leading-[1.25] font-semibold">
        {t('artist.featuring', { name: artistName })}
      </h2>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 xl:gap-5.5">
        {playlists.map((playlist) => (
          <li className="min-w-0" key={playlist.id}>
            <MusicCardLg
              description={
                playlist.user
                  ? t('artist.byUser', { name: playlist.user.username })
                  : t('common.playlist')
              }
              href={ROUTES.playlist(playlist.id)}
              id={playlist.id}
              imageUrl={getPlaylistCoverUrl(playlist.cover)}
              name={playlist.title}
              onPlay={() =>
                void playCollection({
                  id: playlist.id,
                  kind: 'playlist',
                  title: playlist.title,
                })
              }
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
