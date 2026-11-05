import { motionReduced } from '@shared/lib/motion'
import { useEffect } from 'react'

const PANEL = '.artist-release-workspace-panel'

/**
 * Lights panel borders where a mouse pointer is: one delegated listener for the workspace,
 * throttled to a frame, writing the position to the panel's CSS properties.
 */
export function useSpotlight() {
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    let frame = 0
    let lit: HTMLElement | null = null
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || frame) return
      const { target, clientX, clientY } = event
      frame = requestAnimationFrame(() => {
        frame = 0
        const panel =
          target instanceof Element ? target.closest<HTMLElement>(PANEL) : null
        if (lit && lit !== panel) delete lit.dataset.lit
        lit = panel
        if (!panel || motionReduced()) return
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
