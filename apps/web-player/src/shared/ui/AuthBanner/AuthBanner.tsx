'use client'

import { Carousel, CarouselContent, CarouselItem } from '@spotify/ui-react'
import Autoplay from 'embla-carousel-autoplay'
import { useRef } from 'react'

const slides = [
  { src: '/images/banner-1.jpg', alt: 'Banner 1' },
  { src: '/images/banner-2.jpg', alt: 'Banner 2' },
  { src: '/images/banner-3.jpg', alt: 'Banner 3' },
  { src: '/images/banner-4.jpg', alt: 'Banner 4' },
]

export const AuthBanner = () => {
  const plugin = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
    }),
  )

  return (
    <Carousel
      orientation="vertical"
      opts={{
        loop: true,
        align: 'start',
        skipSnaps: false,
        dragFree: false,
        containScroll: 'trimSnaps',
        watchDrag: false,
      }}
      plugins={[plugin.current as any]}
      className="w-1/2 overflow-hidden rounded-[0_10px_10px_0] max-xl:hidden"
    >
      <CarouselContent className="m-0 h-[1008px] w-full">
        {slides.map(({ src, alt }, i) => (
          <CarouselItem key={i} className="p-0 basis-full">
            <img
              src={src}
              alt={alt}
              className="h-full w-full object-cover object-center select-none"
              draggable={false}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
