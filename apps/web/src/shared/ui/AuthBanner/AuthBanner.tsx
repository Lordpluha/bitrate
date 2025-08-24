'use client'

import { Carousel, CarouselContent, CarouselItem } from '@spotify/ui'
import { useRef } from 'react'
import Autoplay from 'embla-carousel-autoplay'

const slides = [
  { src: '/images/banner-1.jpg', alt: 'Banner 1' },
  { src: '/images/banner-2.jpg', alt: 'Banner 2' },
  { src: '/images/banner-3.jpg', alt: 'Banner 3' },
  { src: '/images/banner-4.jpg', alt: 'Banner 4' }
]

export const AuthBanner = () => {
  const plugin = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
      stopOnMouseEnter: false
    })
  )

  return (
    <div className='basis-[50%] overflow-hidden rounded-[0_10px_10px_0] max-lg:hidden absolute h-full top-0 right-5 left-1/2 flex-grow-0'>
      <Carousel
        orientation='vertical'
        opts={{
          loop: true,
          align: 'start',
          skipSnaps: false,
          dragFree: false,
          containScroll: 'trimSnaps',
          watchDrag: false
        }}
        plugins={[plugin.current]}
        className='h-full'
      >
        <CarouselContent className='h-full w-full -mt-0'>
          {slides.map(({ src, alt }, i) => (
            <CarouselItem
              key={i}
              className='relative h-full basis-full'
            >
              <img
                src={src}
                alt={alt}
                className='w-full h-full object-cover select-none'
                draggable={false}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
