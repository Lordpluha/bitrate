import { useEffect, useState } from 'react'

export const useCarouselMediaState = () => {
  const [isLgUp, setIsLgUp] = useState<boolean | null>(null)
  const [canHover, setCanHover] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const lgQuery = window.matchMedia('(min-width: 991px)')
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)')

    const updateIsLgUp = () => setIsLgUp(lgQuery.matches)
    const updateCanHover = () => setCanHover(hoverQuery.matches)

    updateIsLgUp()
    updateCanHover()

    lgQuery.addEventListener('change', updateIsLgUp)
    hoverQuery.addEventListener('change', updateCanHover)

    return () => {
      lgQuery.removeEventListener('change', updateIsLgUp)
      hoverQuery.removeEventListener('change', updateCanHover)
    }
  }, [])

  return { isLgUp, canHover }
}
