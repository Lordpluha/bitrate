import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@spotify/ui-react'
import { useCallback, useState } from 'react'
import config from '../config/video-config.json'
import { useCarouselMediaState } from '../model/useCarouselMediaState'
import { useCarouselSync } from '../model/useCarouselSync'
import { VideoSlide } from './VideoSlide'

const cardWidthClass = 'basis-[60%] sm:basis-[34%] lg:basis-[15%]'

export const ArtistCarousel = () => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)
  const { isLgUp, canHover } = useCarouselMediaState()
  const {
    isCarouselScrolling,
    currentVideoIndex,
    centeredSlideIndex,
    centerPlaySignal,
  } = useCarouselSync(carouselApi, isLgUp)
  const totalVideos = config.videoSlider.length

  const centerSlideOnMobile = useCallback(
    (index: number) => {
      if (!carouselApi || isLgUp !== false) return

      carouselApi.scrollTo(index)
    },
    [carouselApi, isLgUp],
  )

  return (
    <section className="w-full bg-black pt-12 pb-8 text-white">
      <div className="w-full">
        <h2 className="mb-8 px-4 text-4xl font-bold w-full max-w-screen-2xl mx-auto sm:text-5xl">
          Hear from artists
        </h2>

        <div className="relative isolate">
          <Carousel
            className="w-full max-w-480 mx-auto"
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
            setApi={setCarouselApi}
          >
            <div className="relative">
              <CarouselContent className="-ml-2">
                {config.videoSlider.map((item, index) => (
                  <CarouselItem
                    className={`pl-1 sm:pl-2 ${cardWidthClass} max-w-75`}
                    key={item.videoSrc}
                  >
                    <VideoSlide
                      canHover={canHover}
                      centeredSlideIndex={centeredSlideIndex}
                      centerPlaySignal={centerPlaySignal}
                      isCarouselScrolling={isCarouselScrolling}
                      isLgUp={isLgUp ?? false}
                      item={item}
                      onRequestCenter={centerSlideOnMobile}
                      posterSrc={`/carousel/covers/${index + 1}.jpg`}
                      slideIndex={index}
                      videoSrc={
                        item.videoSrc || `/carousel/video/${index + 1}.webm`
                      }
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>

              <button
                aria-label="Previous videos area"
                className="hidden lg:block absolute inset-y-0 left-0 z-40 w-14 xl:w-40 2xl:w-70 cursor-pointer bg-linear-to-r from-black to-transparent"
                onClick={() => carouselApi?.scrollPrev()}
                type="button"
              />

              <button
                aria-label="Next videos area"
                className="hidden lg:block absolute inset-y-0 right-0 z-40 w-14 xl:w-30 2xl:w-45 cursor-pointer bg-linear-to-l from-black to-transparent"
                onClick={() => carouselApi?.scrollNext()}
                type="button"
              />
            </div>

            <div className="lg:justify-start mt-6 flex justify-center gap-2 px-4 sm:px-8 w-full max-w-screen-2xl mx-auto">
              <CarouselPrevious
                aria-label="Previous videos"
                className="static h-14 w-14 translate-x-0 translate-y-0 rounded-full text-white bg-black
              transition-bg-color duration-500
              hover:bg-neutral-800
              [&_svg]:h-8 [&_svg]:w-8"
                variant="ghost"
              />
              <span className="lg:hidden inline-flex min-w-16 items-center justify-center text-base font-semibold text-white/70">
                {currentVideoIndex}/{totalVideos}
              </span>
              <CarouselNext
                aria-label="Next videos"
                className="static h-14 w-14 translate-x-0 translate-y-0 rounded-full text-white bg-black 
              transition-bg-color duration-500
              hover:bg-neutral-800
              [&_svg]:h-8 [&_svg]:w-8"
                variant="ghost"
              />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  )
}
