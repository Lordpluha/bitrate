import type { SceneEnter } from './types'

/** Signal: the laptop and phone settle into a gentle tilt towards the headline (desktop only). */
export const enterHero: SceneEnter = ({ tl, q, mob }) => {
  if (mob) return
  tl.to(
    q('#heroWin'),
    {
      rotateY: -5,
      rotateX: 3,
      rotateZ: -0.5,
      duration: 1.4,
      ease: 'expo.out',
    },
    0.9,
  )
}
