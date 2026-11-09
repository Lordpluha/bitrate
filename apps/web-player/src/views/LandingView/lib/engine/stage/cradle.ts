import { gsap } from 'gsap'
import type * as Three from 'three'
import type { EngineContext } from '../context'
import {
  angleFor,
  CRADLE,
  type CradleState,
  cradleX,
  stepCradle,
} from '../cradlePhysics'
import { token } from '../palette'
import { CHROME_FRAG, CHROME_VERT } from '../shaders'
import type { StageKit } from './types'

/** The swing the cradle starts with: the left ball lifted, ready to click. */
const LIFT = -0.6
/** Rig yaw: the row is seen at an angle. */
const YAW = -0.42
/** Physics sub-steps per frame keep fast clicks from tunnelling. */
const SUBSTEPS = 4
const MAX_DT = 1 / 30

/**
 * Newton's cradle: five chrome balls on the Start scene, hung over its `#cradleSlot`. The balls are
 * real pendulums; the visitor can pull one aside and let go.
 */
export const createCradle = ({
  kit,
  ctx,
  camera,
  ballGeo,
  slot,
}: {
  kit: StageKit
  ctx: EngineContext
  /** Projects the row onto the screen, so the pointer picks the ball it is over. */
  camera: Three.Camera
  /** The unit sphere shared with the partner spheres. */
  ballGeo: Three.SphereGeometry
  slot: HTMLElement
}) => {
  const { THREE, scene, color, board: PX, toWorld } = kit
  const chromeU = {
    uBase: { value: color('neutral-700') },
    uAccent: { value: color('white') },
    uTint: { value: color('purple-400') },
  }
  const chromeMat = new THREE.ShaderMaterial({
    uniforms: chromeU,
    vertexShader: CHROME_VERT,
    fragmentShader: CHROME_FRAG,
  })
  const cradle = new THREE.Group()
  const cradleRig = new THREE.Group()
  cradle.add(cradleRig)
  const CR = { len: CRADLE.len, gap: CRADLE.gap, depth: 0.9, appear: 0 }
  const sim: CradleState = { a: [LIFT, 0, 0, 0, 0], w: [0, 0, 0, 0, 0] }
  let grab: { i: number; a: number } | undefined
  let lastT = 0
  const cradleBalls: Three.Mesh[] = []
  const cradleStrings: { line: Three.Line; i: number; side: number }[] = []
  const stringMat = new THREE.LineBasicMaterial({
    color: color('neutral-400'),
    transparent: true,
    opacity: 0.6,
  })
  for (let i = 0; i < 5; i++) {
    const m = new THREE.Mesh(ballGeo, chromeMat)
    cradleRig.add(m)
    cradleBalls.push(m)
    for (const side of [-1, 1]) {
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(),
          new THREE.Vector3(),
        ]),
        stringMat,
      )
      cradleRig.add(line)
      cradleStrings.push({ line, i, side })
    }
  }
  for (const side of [-1, 1]) {
    const bar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, CR.gap * 5 + 1, 16),
      chromeMat,
    )
    bar.rotation.z = Math.PI / 2
    bar.position.z = side * CR.depth
    cradleRig.add(bar)
  }
  cradleRig.rotation.set(0.18, YAW, 0)
  cradle.visible = false
  scene.add(cradle)

  /** The slot rect is read once per layout change instead of on every frame. */
  let rect = slot.getBoundingClientRect()
  const measure = () => {
    rect = slot.getBoundingClientRect()
  }
  const slotWatch = new ResizeObserver(measure)
  slotWatch.observe(slot)
  if (slot.parentElement) slotWatch.observe(slot.parentElement)

  const swing = (t: number) => {
    const dt = Math.min(MAX_DT, Math.max(0, t - lastT))
    lastT = t
    for (let k = 0; k < SUBSTEPS; k++)
      stepCradle({ s: sim, dt: dt / SUBSTEPS, grab })
    cradleBalls.forEach((b, i) => {
      const a = sim.a[i] ?? 0
      b.position.set(cradleX(sim, i), -Math.cos(a) * CR.len, 0)
    })
    for (const { line, i, side } of cradleStrings) {
      const pos = line.geometry.getAttribute('position')
      const b = cradleBalls[i]?.position
      if (!b) continue
      pos.setXYZ(0, (i - 2) * CR.gap, 0, side * CR.depth)
      pos.setXYZ(1, b.x, b.y + 0.9, b.z)
      pos.needsUpdate = true
    }
  }
  const place = () => {
    const r = rect
    const unit = r.width / (CR.gap * 4 + 2.4)
    const [x, y] = toWorld(r.left + r.width / 2, r.top + 8)
    cradle.position.set(x, y, 1.2)
    cradle.scale.setScalar(unit * PX.k * CR.appear)
  }

  /** Screen x of a point on the row's axis (rig units), through the camera. */
  const probe = new THREE.Vector3()
  const screenX = (x: number) => {
    probe.set(x, -CR.len, 0)
    cradleRig.localToWorld(probe)
    probe.project(camera)
    return ((probe.x + 1) / 2) * window.innerWidth
  }
  /** Pointer x as a position along the row, in rig units (perspective included). */
  const rowX = (clientX: number) => {
    const span = CR.gap * 2
    const left = screenX(-span)
    const right = screenX(span)
    const perUnit = (right - left) / (span * 2) || 1
    return (clientX - (left + right) / 2) / perUnit
  }
  /** A ball's centre and radius on screen. */
  const onScreen = (b: Three.Mesh) => {
    b.getWorldPosition(probe)
    const centre = probe.clone().project(camera)
    const edge = probe
      .add(new THREE.Vector3(b.scale.x * cradle.scale.x, 0, 0))
      .project(camera)
    const sx = ((centre.x + 1) / 2) * window.innerWidth
    const sy = ((1 - centre.y) / 2) * window.innerHeight
    const r = Math.abs(((edge.x + 1) / 2) * window.innerWidth - sx)
    return { sx, sy, r }
  }
  /** The ball under the pointer, if any (a little extra reach for fingers). */
  const ballAt = (x: number, y: number) => {
    let best = -1
    let dist = Number.POSITIVE_INFINITY
    cradleBalls.forEach((b, i) => {
      const { sx, sy, r } = onScreen(b)
      const d = Math.hypot(x - sx, y - sy)
      if (d < r * 1.4 && d < dist) {
        dist = d
        best = i
      }
    })
    return best
  }
  const { signal: abort, state } = ctx
  /* the cradle is drawn larger than its slot: the whole scene listens, but only presses on a ball count */
  const area = slot.closest<HTMLElement>('.scene') ?? slot
  area.addEventListener(
    'pointerdown',
    (e) => {
      if (!cradle.visible || CR.appear < 0.5) return
      const i = ballAt(e.clientX, e.clientY)
      if (i < 0) return
      e.preventDefault()
      area.setPointerCapture(e.pointerId)
      grab = { i, a: angleFor(i, rowX(e.clientX)) }
      state.dragging = true
    },
    { signal: abort },
  )
  area.addEventListener(
    'pointermove',
    (e) => {
      if (grab) {
        grab = { i: grab.i, a: angleFor(grab.i, rowX(e.clientX)) }
        return
      }
      if (e.pointerType === 'mouse' && cradle.visible)
        area.style.cursor = ballAt(e.clientX, e.clientY) >= 0 ? 'grab' : ''
    },
    { signal: abort },
  )
  const release = () => {
    if (!grab) return
    grab = undefined
    state.dragging = false
  }
  area.addEventListener('pointerup', release, { signal: abort })
  area.addEventListener('pointercancel', release, { signal: abort })

  return {
    measure,
    /** Per frame while on screen: swing the balls and follow the slot. */
    frame: (t: number) => {
      if (!cradle.visible) return
      swing(t)
      place()
    },
    /** Springs the cradle in on its scene, shrinks it away on every other. */
    show: (on: boolean) => {
      if (on) {
        cradle.visible = true
        /* every visit starts with a lifted ball, so the first click happens on its own */
        sim.a = [LIFT, 0, 0, 0, 0]
        sim.w = [0, 0, 0, 0, 0]
        CR.appear = 0
        gsap.to(CR, {
          appear: 1,
          duration: 1.4,
          delay: 0.5,
          ease: 'elastic.out(1, .6)',
        })
      } else
        gsap.to(CR, {
          appear: 0,
          duration: 0.4,
          onComplete: () => {
            cradle.visible = false
          },
        })
    },
    retheme: (light: boolean) => {
      chromeU.uBase.value.set(token(light ? 'neutral-400' : 'neutral-700'))
    },
    tweenTargets: [CR],
    dispose: () => {
      slotWatch.disconnect()
      chromeMat.dispose()
      stringMat.dispose()
    },
  }
}
