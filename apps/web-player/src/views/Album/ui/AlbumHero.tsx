import { ArtistLink } from '@entities/Artist'
import { BackButton } from '@shared/ui/BackButton'
import { DateUtils } from '@shared/utils/DateUtils'
import { TimeUtils } from '@shared/utils/TimeUtils'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import type { AlbumResponse } from '@/entities/Album/api/client/albumResponse.schema'

type AlbumHeroProps = {
  album: AlbumResponse
  background: string
  coverUrl: string
  duration: number
  trackCount: number
}

export const AlbumHero = ({
  album,
  background,
  coverUrl,
  duration,
  trackCount,
}: AlbumHeroProps) => (
  <section
    className="relative min-h-85 p-6 text-white max-[1024px]:px-4 max-[1024px]:py-5"
    style={{ background }}
  >
    <BackButton className="absolute left-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 transition-colors hover:bg-black/60 max-[1024px]:static">
      <ArrowLeft aria-hidden="true" className="text-white" size={20} />
    </BackButton>

    <div className="flex h-full flex-row items-end gap-6 pt-14 max-[1024px]:flex-col max-[1024px]:items-start max-[1024px]:gap-4 max-[1024px]:pt-4 max-[640px]:items-center">
      <Image
        alt={`${album.title} cover`}
        className="h-58 w-58 rounded object-cover shadow-2xl max-[1024px]:h-52 max-[1024px]:w-52 max-[640px]:h-44 max-[640px]:w-44"
        height={232}
        src={coverUrl}
        unoptimized
        width={232}
      />
      <div className="flex min-w-0 flex-col gap-2 pb-4 max-[1024px]:pb-0 max-[640px]:w-full max-[640px]:items-center max-[640px]:text-center">
        <span className="text-sm font-bold uppercase tracking-wide text-white/80 max-[1024px]:text-xs">
          Album
        </span>
        <h1 className="max-w-full break-words text-6xl font-bold leading-tight max-[1024px]:text-4xl max-[640px]:text-3xl">
          {album.title}
        </h1>
        {album.description && (
          <p className="max-w-180 text-sm text-white/70">{album.description}</p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm max-[640px]:justify-center">
          <ArtistLink artistId={album.artistId} className="font-semibold" />
          {album.releaseDate && (
            <>
              <span aria-hidden="true" className="text-white/50">
                •
              </span>
              <span>{DateUtils.formatDate(album.releaseDate)}</span>
            </>
          )}
          <span aria-hidden="true" className="text-white/50">
            •
          </span>
          <span>{trackCount} songs</span>
          <span aria-hidden="true" className="text-white/50">
            •
          </span>
          <span>{TimeUtils.formatDuration(duration)}</span>
        </div>
      </div>
    </div>
  </section>
)
