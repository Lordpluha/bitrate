import { gsap } from 'gsap'
import type { SceneEnter } from './types'

/** Signal: the player window settles into its tilt; the progress bar loops (desktop only). */
export const enterHero: SceneEnter = ({ tl, q, mob, loop }) => {
  if (mob) return
  tl.to(
    q('#heroWin'),
    {
      rotateY: -14,
      rotateX: 6,
      rotateZ: -1,
      duration: 1.4,
      ease: 'expo.out',
    },
    0.9,
  )
  loop(
    gsap.fromTo(
      q('#heroProg'),
      { scaleX: 0.3 },
      { scaleX: 0.62, duration: 9, ease: 'none', repeat: -1 },
    ),
  )
}
