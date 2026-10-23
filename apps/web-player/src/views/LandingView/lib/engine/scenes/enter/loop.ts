import type { SceneEnter } from './types'

/** Loop: progress fills and the likes pop. */
export const enterLoop: SceneEnter = ({ tl, q }) => {
  tl.fromTo(
    q('.anim-prog'),
    { scaleX: 0 },
    { scaleX: 0.42, duration: 1.6, ease: 'power2.out' },
    0.8,
  )
  tl.fromTo(
    q('.like-pop'),
    { scale: 0 },
    { scale: 1, duration: 0.5, ease: 'back.out(4)', stagger: 0.15 },
    1.1,
  )
}
