'use client'

import { useArtistPlaylists } from '@entities/Discovery'
import { ROUTES } from '@shared/routes'
import { MusicCardLg } from '@shared/ui'
import { getPlaylistCoverUrl } from '@shared/utils/mediaUrl'

type ArtistFeaturingProps = {
  artistId: string
  artistName: string
}

/** Public playlists people made that feature the artist; hidden when there are none. */
export const ArtistFeaturing = ({
  artistId,
  artistName,
}: ArtistFeaturingProps) => {
  const { data } = useArtistPlaylists(artistId)
  const playlists = data?.data ?? []
  if (playlists.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[19px] leading-[1.25] font-semibold">
        Featuring {artistName}
      </h2>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 xl:gap-5.5">
        {playlists.map((playlist) => (
          <li className="min-w-0" key={playlist.id}>
            <MusicCardLg
              description={
                playlist.user ? `By ${playlist.user.username}` : 'Playlist'
              }
              href={ROUTES.playlist(playlist.id)}
              id={playlist.id}
              imageUrl={getPlaylistCoverUrl(playlist.cover)}
              name={playlist.title}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
