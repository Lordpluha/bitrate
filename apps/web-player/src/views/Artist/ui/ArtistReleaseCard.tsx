import { ROUTES } from '@shared/routes'
import { getAlbumCoverUrl, getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { cn, PlayIcon } from '@spotify/ui-react'
import Image from 'next/image'
import Link from 'next/link'
import type { AlbumRelease, SingleRelease } from '../model/artistDiscography'
import { getReleaseMetadata } from '../model/artistDiscography'
import type { ArtistDiscographyProps } from './ArtistDiscography'

const cardClassName =
  'group block min-w-0 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-4 focus-visible:ring-offset-background-secondary'

const Cover = ({ alt, src }: { alt: string; src: string }) => (
  <div className="relative mb-3 aspect-square overflow-hidden rounded-md shadow-lg shadow-black/20">
    <Image
      alt={alt}
      className="object-cover transition duration-300 group-hover:scale-[1.03] group-hover:brightness-75"
      fill
      sizes="(max-width: 649px) 45vw, (max-width: 1279px) 30vw, 200px"
      src={src}
      unoptimized
    />
    <span
      aria-hidden="true"
      className="absolute bottom-2 right-2 translate-y-2 scale-95 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100"
    >
      <PlayIcon height={44} width={44} />
    </span>
  </div>
)

export const ArtistAlbumCard = ({ release }: { release: AlbumRelease }) => (
  <Link className={cardClassName} href={ROUTES.album(release.album.id)}>
    <Cover
      alt={release.album.title}
      src={getAlbumCoverUrl(release.album.cover)}
    />
    <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-text group-hover:underline">
      {release.album.title}
    </h3>
    <p className="mt-1 text-sm text-text-subdued">
      {getReleaseMetadata(release.album.releaseDate, 'Album')}
    </p>
  </Link>
)

export const ArtistSingleCard = ({
  onPlayTrack,
  release,
}: {
  onPlayTrack: ArtistDiscographyProps['onPlayTrack']
  release: SingleRelease
}) => (
  <button
    aria-label={`Play ${release.track.title}`}
    className={cn(cardClassName, 'w-full cursor-pointer')}
    onClick={() => onPlayTrack(release.track, release.index)}
    type="button"
  >
    <Cover
      alt={release.track.title}
      src={getTrackCoverUrl(release.track.cover)}
    />
    <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-text group-hover:underline">
      {release.track.title}
    </h3>
    <p className="mt-1 text-sm text-text-subdued">
      {getReleaseMetadata(release.track.releaseDate, 'Single')}
    </p>
  </button>
)
