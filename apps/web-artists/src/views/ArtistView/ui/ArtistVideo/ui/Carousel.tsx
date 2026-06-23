import { useCallback, useState } from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@spotify/ui-react'
import config from '../config/video-config.json'
import { useCarouselMediaState } from '../model/useCarouselMediaState'
import { useCarouselSync } from '../model/useCarouselSync'
import { VideoSlide } from './VideoSlide'

const cardWidthClass = 'basis-[60%] sm:basis-[34%] lg:basis-[15%]'

export const ArtistCarousel = () => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)
  const { isLgUp, canHover } = useCarouselMediaState()
  const { isCarouselScrolling, currentVideoIndex, centeredSlideIndex, centerPlaySignal } = useCarouselSync(
    carouselApi,
    isLgUp
  )
  const totalVideos = config.videoSlider.length

  const centerSlideOnMobile = useCallback(
    (index: number) => {
      if (!carouselApi || isLgUp !== false) return

      carouselApi.scrollTo(index)
    },
    [carouselApi, isLgUp]
  )

  return (
    <section className='w-full bg-black pt-12 pb-8 text-white'>
      <div className='w-full'>

        <h2 className='mb-8 px-4 text-4xl font-bold w-full max-w-screen-2xl mx-auto sm:text-5xl'>Hear from artists</h2>

        <div className='relative isolate'>
          <Carousel
            setApi={setCarouselApi}
            opts={{
              align: 'center',
              loop: true,
              slidesToScroll: 1,
              breakpoints: {
                '(min-width: 991px)': {
                  align: 'start',
                  slidesToScroll: 2,
                },
              },
            }}
            className='w-full max-w-480 mx-auto'
          >
            <div className='relative'>
              <CarouselContent className='-ml-2'>
                {config.videoSlider.map((item, index) => (
                  <CarouselItem key={`${item.title}-${index}`} className={`pl-1 sm:pl-2 ${cardWidthClass} max-w-75`}>
                    <VideoSlide
                      slideIndex={index}
                      item={item}
                      videoSrc={item.videoSrc || `/carousel/video/${index + 1}.webm`}
                      posterSrc={`/carousel/covers/${index + 1}.jpg`}
                      isCarouselScrolling={isCarouselScrolling}
                      onRequestCenter={centerSlideOnMobile}
                      centeredSlideIndex={centeredSlideIndex}
                      centerPlaySignal={centerPlaySignal}
                      canHover={canHover}
                      isLgUp={isLgUp ?? false}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>

              <button
                type='button'
                aria-label='Previous videos area'
                onClick={() => carouselApi?.scrollPrev()}
                className='hidden lg:block absolute inset-y-0 left-0 z-40 w-14 xl:w-40 2xl:w-70 cursor-pointer bg-linear-to-r from-black to-transparent'
              />

              <button
                type='button'
                aria-label='Next videos area'
                onClick={() => carouselApi?.scrollNext()}
                className='hidden lg:block absolute inset-y-0 right-0 z-40 w-14 xl:w-30 2xl:w-45 cursor-pointer bg-linear-to-l from-black to-transparent'
              />
            </div>

            <div className='lg:justify-start mt-6 flex justify-center gap-2 px-4 sm:px-8 w-full max-w-screen-2xl mx-auto'>
              <CarouselPrevious
                variant='ghost'
                className='static h-14 w-14 translate-x-0 translate-y-0 rounded-full text-white bg-black
              transition-bg-color duration-500
              hover:bg-neutral-800
              [&_svg]:h-8 [&_svg]:w-8'
                aria-label='Previous videos'
              />
              <span className='lg:hidden inline-flex min-w-16 items-center justify-center text-base font-semibold text-white/70'>
                {currentVideoIndex}/{totalVideos}
              </span>
              <CarouselNext
                variant='ghost'
                className='static h-14 w-14 translate-x-0 translate-y-0 rounded-full text-white bg-black 
              transition-bg-color duration-500
              hover:bg-neutral-800
              [&_svg]:h-8 [&_svg]:w-8'
                aria-label='Next videos'
              />
            </div>
          </Carousel>

        </div>

      </div>
    </section>
  )
}