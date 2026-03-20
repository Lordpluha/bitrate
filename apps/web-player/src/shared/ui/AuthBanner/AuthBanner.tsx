'use client'

import { Carousel, CarouselContent, CarouselItem } from '@spotify/ui-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'
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
      className="w-1/2 overflow-hidden rounded-[0_10px_10px_0] max-xl:hidden"
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
      <CarouselContent className="m-0 h-252 w-full">
        {slides.map(({ src, alt }) => (
          <CarouselItem className="p-0 basis-full" key={src}>
            <div className="relative h-full w-full">
              <Image
                alt={alt}
                className="object-cover object-center select-none"
                draggable={false}
                fill
                sizes="50vw"
                src={src}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
