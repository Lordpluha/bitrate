import { gsap } from 'gsap'
import { BOARD, type EngineContext, must } from '../context'
import { createLayouts, FIELD_COUNT } from '../layouts'
import { isLightTheme, type PaletteToken, token } from '../palette'
import { createCradle } from './cradle'
import { createField } from './field'
import { LOOK } from './looks'
import { createPartners } from './partners'
import { createSignal } from './signal'
import type { BoardFit, StageKit } from './types'

/** The fixed WebGL backdrop: one morphing signal surface, a particle field and two scene props. */
export type Stage = {
  go: (index: number, duration?: number) => void
  retheme: () => void
  start: () => void
  still: () => void
  dispose: () => void
}

const FOV = 42
const CAMZ = 6
/** Pixel-ratio ceiling; the stage lowers it further when frames run slow. */
const MAX_DPR = 1.25
const MIN_DPR = 0.8

/** Whether this browser can create a WebGL context at all. */
export const hasWebGL = () => {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Builds the Three.js stage on the landing canvas. Three.js loads here, lazily, on the client only. */
export const createStage = async ({
  ctx,
  canvas,
}: {
  ctx: EngineContext
  canvas: HTMLCanvasElement
}): Promise<Stage> => {
  const THREE = await import('three')
  const { root, state, signal: abort, pointer } = ctx
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  })
  let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
  renderer.setPixelRatio(dpr)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100)
  camera.position.set(0, 0, CAMZ)
  const PX: BoardFit = { k: 0.01, ox: 0, oy: 0, s: 1 }
  const kit: StageKit = {
    THREE,
    scene,
    color: (name: PaletteToken) => new THREE.Color(token(name)),
    board: PX,
    toWorld: (sx, sy) => [
      (sx - window.innerWidth / 2) * PX.k,
      -(sy - window.innerHeight / 2) * PX.k,
    ],
  }

  const signal = createSignal({ kit, pixelRatio: renderer.getPixelRatio() })
  const LAYOUTS = createLayouts()
  const field = createField({
    kit,
    first: LAYOUTS[0] ?? new Float32Array(FIELD_COUNT * 3),
    pixelRatio: renderer.getPixelRatio(),
    time: signal.time,
  })
  /** One unit sphere for the cradle balls and the partner spheres. */
  const ballGeo = new THREE.SphereGeometry(1, 40, 28)
  const cradle = createCradle({
    kit,
    ballGeo,
    slot: must({ root, selector: '#cradleSlot', type: HTMLElement }),
  })
  const partners = createPartners({ kit, ctx, camera, ballGeo })
  const parts = [signal, field, cradle, partners]

  const halfH = Math.tan((FOV * Math.PI) / 360) * CAMZ
  const timer = new THREE.Timer()
  /** The render loop runs; without it (reduced motion) every change must redraw by itself. */
  let looping = false
  const still = () => renderer.render(scene, camera)
  let last = performance.now()
  let slow = 0
  /* on the GSAP ticker, which also pauses in background tabs */
  const tick = () => {
    const now = performance.now()
    const frameDt = (now - last) / 1000
    slow = now - last > 28 ? slow + 1 : Math.max(0, slow - 1)
    last = now
    /* the intro's load must not lower the scene for good */
    if (state.intro) slow = 0
    if (slow > 20 && dpr > MIN_DPR) {
      dpr = Math.max(MIN_DPR, dpr - 0.15)
      renderer.setPixelRatio(dpr)
      renderer.setSize(window.innerWidth, window.innerHeight, false)
      signal.setPixelRatio(dpr)
      field.setPixelRatio(dpr)
      slow = 0
    }
    timer.update(now)
    const t = timer.getElapsed()
    signal.frame(t, pointer)
    cradle.frame(t)
    partners.frame(frameDt)
    camera.position.x += (pointer.nx * 0.35 - camera.position.x) * 0.04
    camera.position.y += (-pointer.ny * 0.25 - camera.position.y) * 0.04
    camera.lookAt(camera.position.x * 0.6, camera.position.y * 0.6, 0)
    renderer.render(scene, camera)
  }

  let current = 0
  const measure = () => {
    cradle.measure()
    partners.measure()
  }
  const go = (i: number, dur = 1.6) => {
    const L = LOOK[i]
    const layout = LAYOUTS[i]
    if (!L || !layout) return
    current = i
    measure()
    signal.place(L, dur)
    cradle.show(Boolean(L.cradle))
    partners.show(Boolean(L.partners))
    signal.morphTo(L, dur)
    field.morphTo(layout, dur)
  }
  const retheme = () => {
    const light = isLightTheme()
    for (const part of parts) part.retheme(light)
    if (!looping) still()
  }
  const resize = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    const s = Math.min(w / BOARD.width, h / BOARD.height)
    PX.s = s
    PX.ox = (w - BOARD.width * s) / 2
    PX.oy = (h - BOARD.height * s) / 2
    PX.k = (2 * halfH) / h
    field.fit(PX, w, h)
    measure()
    /* without the loop, setSize() leaves a blank canvas: place instantly and redraw */
    const L = LOOK[current]
    if (L) signal.place(L, looping ? 0.01 : 0)
    if (!looping) still()
  }
  window.addEventListener('resize', resize, { signal: abort })
  resize()
  retheme()

  return {
    go,
    retheme,
    start: () => {
      looping = true
      gsap.ticker.add(tick)
    },
    still,
    dispose: () => {
      gsap.ticker.remove(tick)
      gsap.killTweensOf(parts.flatMap((part): object[] => part.tweenTargets))
      scene.traverse((o) => {
        if (
          o instanceof THREE.Mesh ||
          o instanceof THREE.Points ||
          o instanceof THREE.Line
        )
          o.geometry.dispose()
      })
      for (const part of parts) part.dispose()
      renderer.dispose()
    },
  }
}
