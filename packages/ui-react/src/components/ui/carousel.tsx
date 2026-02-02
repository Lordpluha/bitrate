'use client'

import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react'
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type KeyboardEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from '@/icons'
import { cn } from '@/lib/utils'

export type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

export type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: 'horizontal' | 'vertical'
  showNavigation?: boolean
  setApi?: (api: CarouselApi) => void
  slidesToShow?: number
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  showNavigation?: boolean
} & CarouselProps

const CarouselContext = createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = useContext(CarouselContext)

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }

  return context
}

export const CarouselComponent = ({
  orientation = 'horizontal',
  opts,
  setApi,
  plugins,
  showNavigation = true,
  slidesToShow,
  className,
  children,
  ...props
}: Omit<ComponentProps<'div'>, keyof CarouselProps> & CarouselProps) => {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
      ...(slidesToShow && { slidesToScroll: 1 }),
    },
    plugins,
  )
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) {
      return
    }

    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext],
  )

  useEffect(() => {
    if (!api || !setApi) {
      return
    }

    setApi(api)
  }, [api, setApi])

  useEffect(() => {
    if (!api) {
      return
    }

    onSelect(api)
    api.on('reInit', onSelect)
    api.on('select', onSelect)

    return () => {
      api?.off('select', onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation: orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        showNavigation,
      }}
    >
      {/** biome-ignore lint/a11y/useSemanticElements: hz */}
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn('relative', className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {/* When orientation is vertical, ensure the wrapper has a height so Embla can measure slides correctly. */}
        <div className={orientation === 'vertical' ? 'h-full' : 'w-full'}>{children}</div>
      </div>
    </CarouselContext.Provider>
  )
}

export const CarouselContent = ({ className, ...props }: ComponentProps<'div'>) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className={cn('overflow-hidden', orientation === 'vertical' ? 'h-full' : 'w-full')}
    >
      <div
        // Embla expects a flex container as the track. Use row for horizontal and column for vertical.
        className={cn('flex', orientation === 'horizontal' ? 'flex-row' : 'flex-col', className)}
        style={{
          // remove default gaps/margins that could break snap calculations
          gap: 0,
        }}
        {...props}
      />
    </div>
  )
}

export const CarouselItem = ({ className, ...props }: ComponentProps<'div'>) => {
  const { orientation } = useCarousel()

  return (
    /* biome-ignore lint/a11y/useSemanticElements: hz */
    <div
      role="group"
      aria-roledescription="slide"
      // Allow flexible sizing unless explicitly overridden via className
      className={cn('min-w-0 shrink-0 grow-0', className)}
      {...props}
    />
  )
}

export const CarouselPrevious = ({
  className,
  variant = 'default',
  size = 'icon',
  ...props
}: ComponentProps<typeof Button>) => {
  const { orientation, scrollPrev, canScrollPrev, showNavigation } = useCarousel()

  if (showNavigation === false) return null

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'absolute  h-8 w-8 rounded-full',
        orientation === 'horizontal'
          ? '-left-12 top-1/2 -translate-y-1/2'
          : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

export const CarouselNext = ({
  className,
  variant = 'default',
  size = 'icon',
  ...props
}: ComponentProps<typeof Button>) => {
  const { orientation, scrollNext, canScrollNext, showNavigation } = useCarousel()

  if (showNavigation === false) return null

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'absolute h-8 w-8 rounded-full',
        orientation === 'horizontal'
          ? '-right-12 top-1/2 -translate-y-1/2'
          : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

type CarouselComponentType = React.FC<
  Omit<ComponentProps<'div'>, keyof CarouselProps> & CarouselProps
> & {
  Root: typeof CarouselComponent
  Content: typeof CarouselContent
  Item: typeof CarouselItem
  Previous: typeof CarouselPrevious
  Next: typeof CarouselNext
}

export const Carousel = Object.assign(CarouselComponent, {
  Root: CarouselComponent,
  Content: CarouselContent,
  Item: CarouselItem,
  Previous: CarouselPrevious,
  Next: CarouselNext,
}) as CarouselComponentType
