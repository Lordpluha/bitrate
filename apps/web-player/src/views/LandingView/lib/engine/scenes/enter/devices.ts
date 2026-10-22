import { gsap } from 'gsap'
import type { SceneEnter } from './types'

/** Devices: the link draws and the phone slides in (desktop); the sync bar always loops. */
export const enterDevices: SceneEnter = ({ tl, q, mob, loop }) => {
  if (!mob) {
    tl.fromTo(
      q('#devLink'),
      { strokeDashoffset: 300 },
      { strokeDashoffset: 0, duration: 1.4, ease: 'power2.out' },
      1,
    )
    tl.fromTo(
      q('.phone'),
      { x: -120 },
      { x: 0, duration: 1.3, ease: 'expo.out' },
      0.35,
    )
  }
  loop(
    gsap.fromTo(
      q('.sync-bar'),
      { scaleX: 0.3 },
      { scaleX: 0.7, duration: 8, ease: 'none', repeat: -1 },
    ),
  )
}
