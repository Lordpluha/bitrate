'use client'

import { useArtistPlaylists } from '@entities/Discovery'
import { ROUTES } from '@shared/routes'
import { MediaImage } from '@shared/ui/MediaImage'
import { getPlaylistCoverUrl } from '@shared/utils/mediaUrl'
import Link from 'next/link'

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
    <section className="px-4 pb-10 pt-10 sm:px-6">
      <h2 className="mb-2 text-2xl font-bold text-text">
        Featuring {artistName}
      </h2>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {playlists.map((playlist) => (
          <li className="min-w-0" key={playlist.id}>
            <Link
              className="group/card block w-full rounded-lg p-3 text-left transition-colors hover:bg-surface focus:outline-none focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-white"
              href={ROUTES.playlist(playlist.id)}
            >
              <span className="relative mb-3 block aspect-square overflow-hidden rounded-md bg-surface shadow-lg shadow-black/20">
                <MediaImage
                  alt=""
                  className="object-cover transition duration-300 group-hover/card:scale-[1.03]"
                  fallback="playlist"
                  fill
                  sizes="(max-width: 767px) 45vw, (max-width: 1279px) 30vw, 220px"
                  src={getPlaylistCoverUrl(playlist.cover)}
                  unoptimized
                />
              </span>
              <span className="mb-1 block truncate text-sm font-semibold text-text">
                {playlist.title}
              </span>
              {playlist.user ? (
                <span className="line-clamp-2 block text-xs leading-5 text-text-subdued">
                  By {playlist.user.username}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
