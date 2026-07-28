import { Pause, Spinner, Unpause, Volume, VolumeMute } from '@spotify/ui-react'
import Image from 'next/image'
import { memo } from 'react'
import type config from '../config/video-config.json'
import { useVideoSlidePlayback } from '../model/useVideoSlidePlayback'

type SliderItem = (typeof config.videoSlider)[number]

type VideoSlideProps = {
  slideIndex: number
  item: SliderItem
  videoSrc: string
  posterSrc: string
  isCarouselScrolling: boolean
  onRequestCenter: (index: number) => void
  centeredSlideIndex: number
  centerPlaySignal: number
  canHover: boolean
  isLgUp: boolean
}

export const VideoSlide = memo(function VideoSlide({
  slideIndex,
  item,
  videoSrc,
  posterSrc,
  isCarouselScrolling,
  onRequestCenter,
  centeredSlideIndex,
  centerPlaySignal,
  canHover,
  isLgUp,
}: VideoSlideProps) {
  const {
    videoRef,
    hasVideo,
    isPaused,
    isMuted,
    isActivated,
    shouldHidePoster,
    shouldShowLoader,
    isCenteredPlaying,
    handleMouseEnter,
    handleMouseLeave,
    handleCardTap,
    togglePlay,
    toggleMuted,
    setIsDragging,
    setIsVideoReady,
    setIsVideoLoading,
    setIsPaused,
  } = useVideoSlidePlayback({
    slideIndex,
    videoSrc,
    isCarouselScrolling,
    onRequestCenter,
    centeredSlideIndex,
    centerPlaySignal,
    canHover,
    isLgUp,
  })

  return (
    <article className="group w-full max-w-75 max-h-132.5">
      {/* biome-ignore lint/a11y/useSemanticElements: cannot be a real <button> — it wraps nested interactive play/mute buttons, and buttons cannot contain buttons */}
      <div
        aria-label={`Play ${item.title}`}
        className="relative h-full w-full max-h-132.5 max-w-75 overflow-hidden bg-zinc-900"
        onClick={handleCardTap}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleCardTap()
          }
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPointerCancel={() => setIsDragging(false)}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        role="button"
        style={{ aspectRatio: '300 / 530' }}
        tabIndex={0}
      >
        <Image
          alt={item.title}
          className={`z-0 object-cover transition-opacity duration-200 ${shouldHidePoster ? 'opacity-0' : 'opacity-100'}`}
          fill
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 42vw, 68vw"
          src={posterSrc}
        />

        {hasVideo && isActivated ? (
          <video
            className="absolute inset-0 z-10 h-full w-full max-h-132.5 max-w-75 object-cover"
            loop
            muted
            onCanPlay={() => {
              setIsVideoReady(true)
            }}
            onPlaying={() => {
              setIsVideoReady(true)
              setIsVideoLoading(false)
              setIsPaused(false)
            }}
            onWaiting={() => {
              setIsVideoLoading(true)
            }}
            playsInline
            preload="none"
            ref={videoRef}
          >
            <source src={videoSrc} type="video/webm" />
          </video>
        ) : null}

        {shouldShowLoader ? (
          <div className="pointer-events-none absolute inset-0 z-25 flex items-center justify-center bg-white/75">
            <Spinner className="size-12 text-neutral-400" />
          </div>
        ) : null}

        <div
          className={`pointer-events-none absolute inset-0 z-20 bg-black transition-opacity duration-500 ${isCenteredPlaying ? 'opacity-0' : 'opacity-60 group-hover:opacity-0'}`}
        />

        {hasVideo && isActivated ? (
          <div
            className={`pointer-events-none absolute right-2 top-2 z-30 flex flex-col items-center gap-2 transition-opacity duration-200 ${isCenteredPlaying || !canHover ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          >
            <button
              aria-label={isPaused ? 'Play video' : 'Pause video'}
              className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-white
              cursor-pointer
              text-black transition-all duration-300 hover:scale-110"
              onClick={(event) => {
                event.stopPropagation()
                togglePlay()
              }}
              type="button"
            >
              {isPaused ? (
                <Unpause className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </button>

            <button
              aria-label={isMuted ? 'Mute video' : 'UnMute video'}
              className="pointer-events-auto inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-white px-2
              cursor-pointer
              text-black transition-all duration-300 hover:scale-110"
              onClick={(event) => {
                event.stopPropagation()
                toggleMuted()
              }}
              type="button"
            >
              {isMuted ? (
                <VolumeMute className="h-4 w-4" />
              ) : (
                <Volume className="h-4 w-4" />
              )}
            </button>
          </div>
        ) : null}

        <div className="absolute bottom-0 left-0 right-0 z-30 flex justify-between items-center gap-2 px-3 pb-1 pt-10">
          <span className="text-sm text-white text-opacity-30 font-semibold">
            {item.title}
          </span>
          <Image
            alt={`${item.title} avatar`}
            className="h-7 w-7 rounded-full object-cover"
            height={28}
            src={item.imageSrc}
            width={28}
          />
        </div>
      </div>
    </article>
  )
})

VideoSlide.displayName = 'VideoSlide'
