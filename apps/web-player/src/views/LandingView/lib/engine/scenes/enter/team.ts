import type { SceneEnter } from './types'

/** Team: the stats count up. */
export const enterTeam: SceneEnter = ({ tl, scene }) => {
  for (const b of scene.querySelectorAll<HTMLElement>('.stats b')) {
    const o = { v: 0 }
    const to = Number(b.dataset.v) || 0
    tl.to(
      o,
      {
        v: to,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          b.textContent = String(Math.round(o.v))
        },
      },
      0.8,
    )
  }
}
