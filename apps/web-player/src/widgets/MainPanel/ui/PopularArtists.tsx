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
import { SectionHeader } from '@shared/ui'
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
    <section className="relative">
      <SectionHeader title={t('main.popularArtists')} />
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
                <CarouselItem
                  className="mr-4 max-w-50 basis-auto"
                  key={artist.id}
                >
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
    </section>
  )
}
