'use client'

import { useArtists } from '@entities/Artist'
import { MusicCardLg } from '@shared/ui/MusicCardLg'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CustomNextIcon,
  CustomPrevIcon,
} from '@spotify/ui-react'
import { useI18n } from '@/shared/i18n'
import { getArtistAvatarUrl } from '@/shared/utils/mediaUrl'

export const PopularArtists = () => {
  const { t } = useI18n()
  const { data, isPending: loadingArtists } = useArtists()

  const artists = Array.isArray(data)
    ? data.map((artist) => ({
        id: artist.id,
        name: artist.username,
        description: t('common.artist'),
        imageUrl: getArtistAvatarUrl(artist.avatar),
      }))
    : []

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
            ) : artists.length === 0 ? (
              <div className="text-text-subdued p-4">{t('main.noArtists')}</div>
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
