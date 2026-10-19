import { cn } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes'
import { MediaImage } from '@shared/ui/MediaImage'
import { getAlbumCoverUrl, getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { Play } from 'lucide-react'
import Link from 'next/link'
import type { AlbumRelease, SingleRelease } from '../model/artistDiscography'
import { getReleaseMetadata } from '../model/artistDiscography'
import type { ArtistDiscographyProps } from './ArtistDiscography'

const cardClassName =
  'group flex min-w-0 flex-col gap-3 rounded-[14px] border border-border bg-card p-3 text-left outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring'

const Cover = ({ alt, src }: { alt: string; src: string }) => (
  <div className="relative aspect-square overflow-hidden rounded-[9px]">
    <MediaImage
      alt={alt}
      className="object-cover transition duration-300 group-hover:scale-[1.03]"
      fallback="album"
      fill
      sizes="(max-width: 649px) 45vw, (max-width: 1279px) 30vw, 200px"
      src={src}
      unoptimized
    />
    <span
      aria-hidden="true"
      className="absolute right-2 bottom-2 flex size-9 translate-y-2 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
    >
      <Play className="ml-0.5" fill="currentColor" size={16} />
    </span>
  </div>
)

export const ArtistAlbumCard = ({ release }: { release: AlbumRelease }) => (
  <Link className={cardClassName} href={ROUTES.album(release.album.id)}>
    <Cover
      alt={release.album.title}
      src={getAlbumCoverUrl(release.album.cover)}
    />
    <h3 className="line-clamp-1 font-[family-name:var(--font-landing-body)] text-[13px] font-semibold text-foreground">
      {release.album.title}
    </h3>
    <p className="-mt-2 line-clamp-1 text-[10px] text-muted-foreground">
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
    <h3 className="line-clamp-1 font-[family-name:var(--font-landing-body)] text-[13px] font-semibold text-foreground">
      {release.track.title}
    </h3>
    <p className="-mt-2 line-clamp-1 text-[10px] text-muted-foreground">
      {getReleaseMetadata(release.track.releaseDate, 'Single')}
    </p>
  </button>
)
