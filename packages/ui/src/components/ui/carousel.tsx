'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import * as React from 'react'

import useEmblaCarousel, {
  type UseEmblaCarouselType
} from 'embla-carousel-react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: 'horizontal' | 'vertical'
  showNavigation?: boolean
  slidesToShow?: number
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  showNavigation?: boolean
  slidesToShow?: number
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }

  return context
}

const CarouselComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = 'horizontal',
      opts,
      setApi,
      plugins,
      showNavigation = true,
      slidesToShow = 1,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === 'horizontal' ? 'x' : 'y'
      },
      plugins
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return
      }

      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === 'ArrowRight') {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    React.useEffect(() => {
      if (!api || !setApi) {
        return
      }

      setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
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
          orientation:
            orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          showNavigation,
          slidesToShow
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn('relative', className)}
          role='region'
          aria-roledescription='carousel'
          {...props}
        >
          {/* When orientation is vertical, ensure the wrapper has a height so Embla can measure slides correctly. */}
          <div className={orientation === 'vertical' ? 'h-full' : 'w-full'}>
            {children}
          </div>
        </div>
      </CarouselContext.Provider>
    )
  }
)
CarouselComponent.displayName = 'Carousel'

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className={cn(
        'overflow-hidden',
        orientation === 'vertical' ? 'h-full' : 'w-full'
      )}
    >
      <div
        ref={ref}
        // Embla expects a flex container as the track. Use row for horizontal and column for vertical.
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          className
        )}
        style={{
          // remove default gaps/margins that could break snap calculations
          gap: 0
        }}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = 'CarouselContent'

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation, slidesToShow = 1 } = useCarousel()

  // Check if className contains basis-auto to use auto sizing
  const isAutoSizing = className?.includes('basis-auto')

  if (isAutoSizing) {
    return (
      <div
        ref={ref}
        role='group'
        aria-roledescription='slide'
        className={cn('min-w-0 shrink-0 grow-0 basis-auto', className)}
        {...props}
      />
    )
  }

  const widthPercentage = `${100 / slidesToShow}%`
  const heightPercentage = `${100 / slidesToShow}%`

  return (
    <div
      ref={ref}
      role='group'
      aria-roledescription='slide'
      className={cn('min-w-0 shrink-0 grow-0', className)}
      style={
        orientation === 'horizontal'
          ? ({
              minWidth: widthPercentage,
              flex: `0 0 ${widthPercentage}`
            } as React.CSSProperties)
          : ({
              minHeight: heightPercentage,
              flex: `0 0 ${heightPercentage}`
            } as React.CSSProperties)
      }
      {...props}
    />
  )
})
CarouselItem.displayName = 'CarouselItem'

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { icon?: React.ReactNode }
>(({ className, variant = 'ghost', size = 'icon', icon, ...props }, ref) => {
  const { scrollPrev, canScrollPrev, showNavigation } = useCarousel()

  if (showNavigation === false) return null

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(className)}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      {icon || <ArrowLeft className='h-4 w-4' />}
      <span className='sr-only'>Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = 'CarouselPrevious'

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { icon?: React.ReactNode }
>(({ className, variant = 'ghost', size = 'icon', icon, ...props }, ref) => {
  const { scrollNext, canScrollNext, showNavigation } = useCarousel()

  if (showNavigation === false) return null

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(className)}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      {icon || <ArrowRight className='h-4 w-4' />}
      <span className='sr-only'>Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = 'CarouselNext'

export const Carousel = Object.assign(CarouselComponent, {
  Root: CarouselComponent,
  Content: CarouselContent,
  Item: CarouselItem,
  Previous: CarouselPrevious,
  Next: CarouselNext
})

export { CarouselContent, CarouselItem, CarouselPrevious, CarouselNext }

export type { CarouselApi }
