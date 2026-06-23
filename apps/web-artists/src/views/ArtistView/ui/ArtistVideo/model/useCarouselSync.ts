import { useEffect, useRef, useState } from 'react'
import type { CarouselApi } from '@spotify/ui-react'

export const useCarouselSync = (carouselApi: CarouselApi | null, isLgUp: boolean | null) => {
  const [isCarouselScrolling, setIsCarouselScrolling] = useState(false)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(1)
  const [centeredSlideIndex, setCenteredSlideIndex] = useState(0)
  const [centerPlaySignal, setCenterPlaySignal] = useState(0)
  const lastCenteredIndexRef = useRef(0)

  useEffect(() => {
    if (!carouselApi) return

    const onScroll = () => {
      setIsCarouselScrolling((prev) => (prev ? prev : true))
    }

    const onSettle = () => {
      setIsCarouselScrolling(false)
      const centeredIndex = carouselApi.selectedScrollSnap()
      setCenteredSlideIndex(centeredIndex)

      if (isLgUp === false && centeredIndex !== lastCenteredIndexRef.current) {
        setCenterPlaySignal((prev) => prev + 1)
      }

      lastCenteredIndexRef.current = centeredIndex
    }

    const onSelect = () => {
      const selectedIndex = carouselApi.selectedScrollSnap()
      setCurrentVideoIndex(selectedIndex + 1)
      setCenteredSlideIndex(selectedIndex)
      lastCenteredIndexRef.current = selectedIndex
    }

    carouselApi.on('scroll', onScroll)
    carouselApi.on('settle', onSettle)
    carouselApi.on('select', onSelect)
    carouselApi.on('reInit', onSelect)

    onSelect()

    if (isLgUp === false) {
      setCenterPlaySignal((prev) => prev + 1)
    }

    return () => {
      carouselApi.off('scroll', onScroll)
      carouselApi.off('settle', onSettle)
      carouselApi.off('select', onSelect)
      carouselApi.off('reInit', onSelect)
    }
  }, [carouselApi, isLgUp])

  return {
    isCarouselScrolling,
    currentVideoIndex,
    centeredSlideIndex,
    centerPlaySignal,
  }
}
