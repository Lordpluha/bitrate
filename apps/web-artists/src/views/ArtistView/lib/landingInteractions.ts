import { motionReduced } from '@shared/lib/motion'
import { type PointerEvent, type RefObject, useEffect } from 'react'

const MAGNETIC_PULL = 8

/** Safe motion check that also works in unit test environments (jsdom) without matchMedia. */
export function isMotionReduced() {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return true
  }
  return motionReduced()
}

/**
 * Subtle magnetic cursor pull for dock pills and primary CTAs.
 * Writes CSS custom properties directly to avoid React re-renders on pointer move.
 */
export const magneticHandlers = {
  onPointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse' || isMotionReduced()) return
    const element = event.currentTarget
    const rect = element.getBoundingClientRect()
    const offsetX =
      (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
    const offsetY =
      (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
    element.style.setProperty(
      '--mag-x',
      `${(offsetX * MAGNETIC_PULL).toFixed(2)}px`,
    )
    element.style.setProperty(
      '--mag-y',
      `${(offsetY * (MAGNETIC_PULL * 0.65)).toFixed(2)}px`,
    )
  },
  onPointerLeave(event: PointerEvent<HTMLElement>) {
    event.currentTarget.style.removeProperty('--mag-x')
    event.currentTarget.style.removeProperty('--mag-y')
  },
}

/**
 * Pointer-tracked radial glow for `.artist-spotlight-card` surfaces and borders.
 */
export const spotlightCardHandlers = {
  onPointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse' || isMotionReduced()) return
    const card = event.currentTarget
    const rect = card.getBoundingClientRect()
    card.style.setProperty(
      '--spot-x',
      `${(event.clientX - rect.left).toFixed(1)}px`,
    )
    card.style.setProperty(
      '--spot-y',
      `${(event.clientY - rect.top).toFixed(1)}px`,
    )
    card.dataset.lit = 'true'
  },
  onPointerLeave(event: PointerEvent<HTMLElement>) {
    delete event.currentTarget.dataset.lit
  },
}

/**
 * Aceternity-style 3D Container Scroll interpolation:
 * Starts tilted in 3D perspective (`--scroll-flatten: 0`) at the top of the page
 * and flattens smoothly to `1` as the user scrolls into the studio stage.
 */
export function useContainerScrollFlatten(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current
    if (!element || isMotionReduced()) {
      element?.style.setProperty('--scroll-flatten', '1')
      return
    }

    let frame = 0
    const update = () => {
      frame = 0
      const target = ref.current
      if (!target) return
      const rect = target.getBoundingClientRect()
      const viewportHeight = window.innerHeight || 900
      const start = viewportHeight * 0.64
      const end = viewportHeight * 0.18
      const raw = (start - rect.top) / Math.max(1, start - end)
      const clamped = Math.min(1, Math.max(0, raw))
      target.style.setProperty('--scroll-flatten', clamped.toFixed(3))
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [ref])
}

const WORKSPACE_PANEL = '.artist-release-workspace-panel'

/**
 * Lights `.artist-release-workspace-panel` borders under the pointer inside the replica,
 * matching `ArtistDashboard`'s `useSpotlight` while guarding `matchMedia` for unit tests.
 */
export function useWorkspacePanelSpotlight() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function' ||
      !window.matchMedia('(pointer: fine)').matches
    ) {
      return
    }
    let frame = 0
    let lit: HTMLElement | null = null
    const move = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== 'mouse' || frame) return
      const { target, clientX, clientY } = event
      frame = requestAnimationFrame(() => {
        frame = 0
        const panel =
          target instanceof Element
            ? target.closest<HTMLElement>(WORKSPACE_PANEL)
            : null
        if (lit && lit !== panel) delete lit.dataset.lit
        lit = panel
        if (!panel || isMotionReduced()) return
        const box = panel.getBoundingClientRect()
        panel.style.setProperty('--spot-x', `${clientX - box.left}px`)
        panel.style.setProperty('--spot-y', `${clientY - box.top}px`)
        panel.dataset.lit = 'true'
      })
    }
    document.addEventListener('pointermove', move, { passive: true })
    return () => {
      document.removeEventListener('pointermove', move)
      cancelAnimationFrame(frame)
      if (lit) delete lit.dataset.lit
    }
  }, [])
}
