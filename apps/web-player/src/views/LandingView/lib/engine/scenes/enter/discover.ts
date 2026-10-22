import { gsap } from 'gsap'
import type { SceneEnter } from './types'

/** Discover: the graph links draw themselves, nodes pop and tags fade in (desktop only). */
export const enterDiscover: SceneEnter = ({ tl, scene, q, mob }) => {
  if (mob) return
  for (const p of scene.querySelectorAll<SVGPathElement>('.graph path')) {
    const L = p.getTotalLength()
    tl.fromTo(
      p,
      { strokeDasharray: `${L} ${L}`, strokeDashoffset: L },
      {
        strokeDashoffset: 0,
        duration: 1.1,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.set(p, { clearProps: 'strokeDasharray,strokeDashoffset' })
        },
      },
      0.7 + Math.random() * 0.4,
    )
  }
  tl.fromTo(
    q('.node'),
    { scale: 0, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: 0.7,
      ease: 'back.out(2)',
      stagger: { each: 0.07, from: 'end' },
    },
    0.6,
  )
  tl.fromTo(
    q('.tag'),
    { opacity: 0 },
    { opacity: 1, duration: 0.4, stagger: 0.06 },
    1.4,
  )
}
