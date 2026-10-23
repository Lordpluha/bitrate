import { gsap } from 'gsap'
import type { SceneEnter } from './types'

/** Your rules: the queue toggle flips on; on desktop the bands dance and the floating card drifts in. */
export const enterRules: SceneEnter = ({ tl, scene, q, mob, loop }) => {
  const tgQueue = scene.querySelector('#tgQueue')
  tgQueue?.classList.remove('on')
  tl.call(() => tgQueue?.classList.add('on'), undefined, 1.2)
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
  tl.fromTo(
    q('#floatQ'),
    { x: -230, y: 140, rotate: 0, opacity: 0 },
    {
      x: 0,
      y: 0,
      rotate: -5,
      opacity: 1,
      duration: 1.4,
      ease: 'expo.out',
    },
    1.3,
  )
  loop(
    gsap.to(q('#floatQ'), {
      y: -10,
      rotate: -3.5,
      duration: 2.4,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: 2.8,
    }),
  )
}
