'use client'

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CustomNextIcon,
  CustomPrevIcon,
} from '@spotify/ui-react'
import { useCallback, useEffect, useState } from 'react'
import type { MediaCardItem } from '@/features/Search/model/types'
import { MusicCardLg } from '@/shared/ui'

type MediaRowProps = {
  items: MediaCardItem[]
  title: string
}

export const MediaRow = ({ items, title }: MediaRowProps) => {
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
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-text">{title}</h2>
        {items.length > 5 ? (
          <span className="text-xs font-bold uppercase text-text-subdued">
            Show all
          </span>
        ) : null}
      </div>
      <div className="group relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[164px] md:h-[178px]">
          {canScrollPrev ? (
            <button
              aria-label={`Previous ${title}`}
              className="pointer-events-auto absolute left-0 top-1/2 flex h-8 w-8 -translate-x-3 -translate-y-1/2 items-center justify-center rounded-full bg-background-elevated text-text ring-1 ring-border opacity-0 shadow-lg transition-opacity hover:scale-105 group-hover:opacity-100"
              onClick={() => carouselApi?.scrollPrev()}
              type="button"
            >
              <CustomPrevIcon className="h-5 w-5" />
            </button>
          ) : null}
          {canScrollNext ? (
            <button
              aria-label={`Next ${title}`}
              className="pointer-events-auto absolute right-0 top-1/2 flex h-8 w-8 translate-x-3 -translate-y-1/2 items-center justify-center rounded-full bg-background-elevated text-text ring-1 ring-border opacity-0 shadow-lg transition-opacity hover:scale-105 group-hover:opacity-100"
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
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}
