import { gsap } from 'gsap'
import type { SceneEnter } from './types'

/** Your rules: the decorative audio bands dance beside the headline (desktop only). */
export const enterRules: SceneEnter = ({ q, mob, loop }) => {
  if (mob) return
  loop(
    gsap.fromTo(
      q('#bands i'),
      { scaleY: 0.1 },
      {
        scaleY: () => 0.25 + Math.random() * 0.75,
        duration: 0.5,
        ease: 'sine.inOut',
        stagger: { each: 0.05, repeat: -1, yoyo: true },
      },
    ),
  )
}
