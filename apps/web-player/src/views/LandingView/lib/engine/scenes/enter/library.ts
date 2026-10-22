import { typeInto } from './typeInto'
import type { SceneEnter } from './types'

/** Library: the search types itself, results and versions slide in. */
export const enterLibrary: SceneEnter = ({ tl, scene, q, copy }) => {
  typeInto({
    tl,
    el: scene.querySelector('#libQ'),
    text: copy('library.night'),
    duration: 0.8,
    at: 0.8,
  })
  tl.fromTo(
    q('.lres'),
    { y: 14, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, stagger: 0.07 },
    1.3,
  )
  tl.fromTo(
    q('.vrow'),
    { x: 20, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.5, stagger: 0.12 },
    1,
  )
}
