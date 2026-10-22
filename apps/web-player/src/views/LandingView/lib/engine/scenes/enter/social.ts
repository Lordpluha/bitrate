import type { SceneEnter } from './types'

/** Social: comment marks pop on the waveform and the comments rise (desktop only). */
export const enterSocial: SceneEnter = ({ tl, q, mob }) => {
  if (mob) return
  tl.fromTo(
    q('.cmark'),
    { scale: 0 },
    { scale: 1, duration: 0.4, ease: 'back.out(3)', stagger: 0.12 },
    0.9,
  )
  tl.fromTo(
    q('.cmt'),
    { y: 16, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, stagger: 0.25 },
    1.2,
  )
}
