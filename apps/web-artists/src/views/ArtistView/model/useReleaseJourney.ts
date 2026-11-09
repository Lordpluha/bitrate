import { useEffect, useRef, useState } from 'react'
import { isMotionReduced } from '../lib/landingInteractions'

export type JourneyStep = 0 | 1 | 2

/** Native page scrolling drives a single pinned scene; no wheel or touch interception. */
export function useReleaseJourney() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState<JourneyStep>(0)

  useEffect(() => {
    const section = sectionRef.current
    const pin = pinRef.current
    if (!section || !pin || typeof window.matchMedia !== 'function') return

    let frame = 0
    let top = 0
    let distance = 1
    let pinned = true
    const update = () => {
      frame = 0
      if (!pinned) return
      const progress = Math.min(
        1,
        Math.max(0, (top - section.getBoundingClientRect().top) / distance),
      )
      section.style.setProperty('--journey-progress', String(progress))
      setActiveStep(progress < 1 / 3 ? 0 : progress < 2 / 3 ? 1 : 2)
    }
    const measure = () => {
      const style = getComputedStyle(pin)
      pinned = style.position === 'sticky' && !isMotionReduced()
      top = Number.parseFloat(style.top) || 0
      distance = Math.max(1, section.offsetHeight - pin.offsetHeight)
      update()
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(section)
    observer.observe(pin)
    const visibility = new IntersectionObserver(([entry]) => {
      section.dataset.visible = String(entry?.isIntersecting ?? false)
    })
    visibility.observe(pin)
    preference.addEventListener('change', measure)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      visibility.disconnect()
      preference.removeEventListener('change', measure)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const selectStep = (step: JourneyStep) => {
    const section = sectionRef.current
    const pin = pinRef.current
    if (
      !section ||
      !pin ||
      isMotionReduced() ||
      getComputedStyle(pin).position !== 'sticky'
    ) {
      setActiveStep(step)
      section?.style.setProperty('--journey-progress', String(step / 2))
      return
    }
    const top = Number.parseFloat(getComputedStyle(pin).top) || 0
    const distance = Math.max(0, section.offsetHeight - pin.offsetHeight)
    window.scrollTo({
      top:
        section.getBoundingClientRect().top +
        window.scrollY -
        top +
        distance * ((step + 0.5) / 3),
      behavior: 'smooth',
    })
  }

  return { sectionRef, pinRef, activeStep, selectStep }
}
