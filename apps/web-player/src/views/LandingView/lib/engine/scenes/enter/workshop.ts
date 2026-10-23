import { gsap } from 'gsap'
import { type EngineContext, isMobile } from '../../context'
import { typeInto } from './typeInto'
import type { SceneEnter } from './types'

const SHUFFLE_EVERY_MS = 2600
/** The re-ranking starts once the candidates have arrived. */
const SHUFFLE_AT_S = 2.6

/** Workshop: the prompt types itself, the meter fills and the candidates slide in. */
export const enterWorkshop: SceneEnter = ({ tl, scene, q, copy }) => {
  typeInto({
    tl,
    el: scene.querySelector('#typed'),
    text: copy('workshop.prompt'),
    duration: 2,
    at: 0.8,
  })
  tl.fromTo(
    q('#wsFill'),
    { scaleX: 0 },
    { scaleX: 0.66, duration: 1.2, ease: 'power2.inOut' },
    0.8,
  )
  tl.fromTo(
    q('.cand'),
    { x: 40, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.6, stagger: 0.08 },
    1.2,
  )
}

/**
 * Workshop candidates re-rank every few seconds while the scene is on screen (FLIP, transforms
 * only). Returns the workshop entrance hook that schedules it.
 */
export const mountWorkshopShuffle = (ctx: EngineContext): SceneEnter => {
  const { root, scenes, state } = ctx
  const stack = root.querySelector('#stack')
  let shuffleTimer = 0
  ctx.onDispose(() => window.clearInterval(shuffleTimer))
  const shuffle = () => {
    window.clearInterval(shuffleTimer)
    if (!stack) return
    shuffleTimer = window.setInterval(() => {
      if (scenes[state.index]?.id !== 'workshop') {
        window.clearInterval(shuffleTimer)
        return
      }
      const items = [...stack.children].filter(
        (el): el is HTMLElement => el instanceof HTMLElement,
      )
      const firstItem = items[0]
      if (!firstItem) return
      const first = items.map((el) => el.getBoundingClientRect().top)
      stack.appendChild(firstItem)
      ;[...stack.children].forEach((el, k) => {
        const r = el.querySelector('.r')
        if (r) r.textContent = `#${k + 1}`
      })
      const last = items.map((el) => el.getBoundingClientRect().top)
      const scale = isMobile()
        ? 1
        : Number(getComputedStyle(root).getPropertyValue('--s')) || 1
      items.forEach((el, k) => {
        gsap.fromTo(
          el,
          { y: ((first[k] ?? 0) - (last[k] ?? 0)) / scale },
          { y: 0, duration: 0.8, ease: 'expo.inOut' },
        )
      })
    }, SHUFFLE_EVERY_MS)
  }
  return ({ tl }) => {
    tl.call(shuffle, undefined, SHUFFLE_AT_S)
  }
}
