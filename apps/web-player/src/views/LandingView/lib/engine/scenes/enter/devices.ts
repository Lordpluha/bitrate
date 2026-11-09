import type { SceneEnter } from './types'

/** Devices: the phone slides in beside the desktop window (desktop only). */
export const enterDevices: SceneEnter = ({ tl, q, mob }) => {
  if (mob) return
  tl.fromTo(
    q('.phone'),
    { x: -120 },
    { x: 0, duration: 1.3, ease: 'expo.out' },
    0.35,
  )
}
