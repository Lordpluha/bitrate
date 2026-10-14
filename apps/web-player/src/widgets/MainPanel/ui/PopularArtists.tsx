'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CustomNextIcon,
  CustomPrevIcon,
} from '@bitrate/ui-react'
import { useArtistCharts } from '@entities/Discovery'
import { MusicCardLg } from '@shared/ui/MusicCardLg'
import { useI18n } from '@/shared/i18n'
import { getArtistAvatarUrl } from '@/shared/utils/mediaUrl'

/** Artists ranked by distinct listeners (`GET /charts/artists`); hidden when nobody has listened yet. */
export const PopularArtists = () => {
  const { t } = useI18n()
  const { data, isPending: loadingArtists } = useArtistCharts()

  const artists = (data?.data ?? []).map((artist) => ({
    id: artist.id,
    name: artist.username,
    description: t('common.artist'),
    imageUrl: getArtistAvatarUrl(artist.avatar),
  }))

  if (!loadingArtists && artists.length === 0) return null

  return (
    <div className="relative mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-text text-2xl font-bold">
          {t('main.popularArtists')}
        </h2>
      </div>
      <div className="relative group">
        <Carousel className="w-full" slidesToShow={5}>
          <CarouselPrevious
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-background-secondary"
            icon={<CustomPrevIcon />}
          />
          <CarouselNext
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-background-secondary"
            icon={<CustomNextIcon />}
          />
          <CarouselContent className="flex">
            {loadingArtists ? (
              <div className="text-text-subdued p-4">{t('common.loading')}</div>
            ) : (
              artists.map((artist) => (
                <CarouselItem className="basis-auto max-w-50" key={artist.id}>
                  <MusicCardLg
                    description={artist.description}
                    id={artist.id}
                    imageUrl={artist.imageUrl}
                    isArtist={true}
                    name={artist.name}
                  />
                </CarouselItem>
              ))
            )}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  )
}
