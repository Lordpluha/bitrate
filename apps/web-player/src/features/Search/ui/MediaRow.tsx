'use client'

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CustomNextIcon,
  CustomPrevIcon,
} from '@bitrate/ui-react'
import { useCallback, useEffect, useState } from 'react'
import type { MediaCardItem } from '@/features/Search/model/types'
import { MusicCardLg, SectionHeader } from '@/shared/ui'

type MediaRowProps = {
  items: MediaCardItem[]
  /** Starts an item that can play (`playKind`) from its card's play button. */
  onPlayItem?: (item: MediaCardItem) => void
  title: string
}

export const MediaRow = ({ items, onPlayItem, title }: MediaRowProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const updateCarouselState = useCallback((api: CarouselApi | undefined) => {
    setCanScrollPrev(Boolean(api?.canScrollPrev()))
    setCanScrollNext(Boolean(api?.canScrollNext()))
  }, [])

  useEffect(() => {
    if (!carouselApi) return

    updateCarouselState(carouselApi)
    carouselApi.on('select', updateCarouselState)
    carouselApi.on('reInit', updateCarouselState)

    return () => {
      carouselApi.off('select', updateCarouselState)
      carouselApi.off('reInit', updateCarouselState)
    }
  }, [carouselApi, updateCarouselState])

  if (items.length === 0) return null

  return (
    <section>
      <SectionHeader title={title} />
      <div className="group relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[164px] md:h-[178px]">
          {canScrollPrev ? (
            <button
              aria-label={`Previous ${title}`}
              className="pointer-events-auto absolute left-0 top-1/2 flex h-8 w-8 -translate-x-3 -translate-y-1/2 items-center justify-center rounded-full bg-background-elevated text-foreground ring-1 ring-border opacity-0 shadow-lg transition-opacity hover:scale-105 group-hover:opacity-100"
              onClick={() => carouselApi?.scrollPrev()}
              type="button"
            >
              <CustomPrevIcon className="h-5 w-5" />
            </button>
          ) : null}
          {canScrollNext ? (
            <button
              aria-label={`Next ${title}`}
              className="pointer-events-auto absolute right-0 top-1/2 flex h-8 w-8 translate-x-3 -translate-y-1/2 items-center justify-center rounded-full bg-background-elevated text-foreground ring-1 ring-border opacity-0 shadow-lg transition-opacity hover:scale-105 group-hover:opacity-100"
              onClick={() => carouselApi?.scrollNext()}
              type="button"
            >
              <CustomNextIcon className="h-5 w-5" />
            </button>
          ) : null}
        </div>
        <Carousel
          className="w-full"
          opts={{ align: 'start' }}
          setApi={setCarouselApi}
          showNavigation={false}
          slidesToShow={6}
        >
          <CarouselContent className="flex">
            {items.slice(0, 12).map((item) => (
              <CarouselItem
                className="mr-4 basis-[164px] shrink-0 md:basis-[178px]"
                key={`${title}-${item.id}`}
              >
                <MusicCardLg
                  description={item.description}
                  href={item.href}
                  id={item.id}
                  imageUrl={item.image}
                  name={item.title}
                  onPlay={
                    item.playKind && onPlayItem
                      ? () => onPlayItem(item)
                      : undefined
                  }
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}
