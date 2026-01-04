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
    <div className="basis-[50%] overflow-hidden rounded-[0_10px_10px_0] max-lg:hidden absolute h-full top-0 right-5 left-1/2 flex-grow-0">
      <Carousel
        className="h-full"
        opts={{
          loop: true,
          align: 'start',
          skipSnaps: false,
          dragFree: false,
          containScroll: 'trimSnaps',
          watchDrag: false,
        }}
        orientation="vertical"
        plugins={[plugin.current]}
      >
        <CarouselContent className="h-full w-full mt-0">
          {slides.map(({ src, alt }) => (
            <CarouselItem className="relative h-full basis-full" key={src}>
              <img
                alt={alt}
                className="w-full h-full object-cover select-none"
                draggable={false}
                src={src}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
