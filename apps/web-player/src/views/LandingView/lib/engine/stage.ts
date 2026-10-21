import { gsap } from 'gsap'
import type * as Three from 'three'
import { BOARD, type EngineContext, isMobile, must, rnd } from './context'
import { createLayouts, FIELD_COUNT, LUMA } from './layouts'
import { PARTNER_MARKS, type PartnerMark } from './marks'
import { isLightTheme, type PaletteToken, token } from './palette'
import { collideBalls } from './physics'
import {
  CHROME_FRAG,
  CHROME_VERT,
  FIELD_FRAG,
  FIELD_VERT,
  SKIN_FRAG,
  SURFACE_FRAG,
  SURFACE_VERT,
} from './shaders'

/** The fixed WebGL backdrop: one morphing signal surface, a particle field and two scene props. */
export type Stage = {
  go: (index: number, duration?: number) => void
  retheme: () => void
  start: () => void
  still: () => void
  dispose: () => void
}

type Look = {
  shape: number
  x: number
  y: number
  size: number
  rx: number
  rz?: number
  amp: number
  twist: number
  c: readonly [PaletteToken, PaletteToken, PaletteToken]
  partners?: boolean
  cradle?: boolean
}

/** Per scene: shape, board position (px), size (px), tilt, twist, noise and palette. */
export const LOOK: readonly Look[] = [
  {
    shape: 0,
    x: 1000,
    y: 455,
    size: 560,
    rx: 0.2,
    amp: 0.2,
    twist: 0,
    c: ['purple-500', 'magenta-500', 'blue-500'],
  },
  {
    shape: 2,
    x: 1180,
    y: 150,
    size: 330,
    rx: 0.5,
    amp: 0.08,
    twist: 0,
    c: ['purple-500', 'purple-400', 'magenta-500'],
  },
  {
    shape: 4,
    x: 250,
    y: 790,
    size: 300,
    rx: 0.4,
    amp: 0.1,
    twist: 0,
    c: ['magenta-500', 'purple-500', 'blue-500'],
  },
  {
    shape: 3,
    x: 180,
    y: 760,
    size: 360,
    rx: 1.15,
    amp: 0.03,
    twist: 0,
    c: ['purple-500', 'magenta-500', 'purple-400'],
  },
  {
    shape: 6,
    x: 1000,
    y: 150,
    size: 200,
    rx: 0,
    rz: 1.5708,
    amp: 0.06,
    twist: 0,
    c: ['purple-400', 'blue-500', 'magenta-500'],
  },
  {
    shape: 5,
    x: LUMA[0],
    y: LUMA[1] - 18,
    size: 260,
    rx: 0.3,
    amp: 0.1,
    twist: 0,
    c: ['purple-400', 'magenta-500', 'blue-500'],
  },
  {
    shape: 1,
    x: 170,
    y: 780,
    size: 300,
    rx: 1.0,
    amp: 0.2,
    twist: 2.4,
    c: ['purple-500', 'green-500', 'blue-500'],
  },
  {
    shape: 0,
    x: 900,
    y: 470,
    size: 620,
    rx: 0,
    amp: 0.42,
    twist: 0.8,
    c: ['magenta-500', 'purple-500', 'blue-500'],
  },
  {
    shape: 5,
    x: 330,
    y: 110,
    size: 130,
    rx: 0.3,
    amp: 0.2,
    twist: 0,
    c: ['magenta-500', 'purple-500', 'blue-500'],
    partners: true,
  },
  {
    shape: 0,
    x: 380,
    y: 96,
    size: 100,
    rx: 0,
    amp: 0.35,
    twist: 0,
    c: ['purple-400', 'blue-500', 'magenta-500'],
  },
  {
    shape: 7,
    x: 720,
    y: 1020,
    size: 1000,
    rx: 0.05,
    amp: 0.16,
    twist: 0,
    c: ['purple-500', 'magenta-500', 'blue-500'],
    cradle: true,
  },
]
/** On phones the signal sits in the top-right corner, as a share of the viewport. */
const MOBILE_LOOK = { x: 0.8, y: 0.14, size: 0.42 }
const FOV = 42
const CAMZ = 6
/** Pixel-ratio ceiling; the stage lowers it further when frames run slow. */
const MAX_DPR = 1.25
const MIN_DPR = 0.8

type Ball = { m: Three.Mesh; r: number; p: Three.Vector3; v: Three.Vector3 }

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
  const { root, state, signal, pointer } = ctx
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
  /** k: world units per screen pixel; ox/oy/s: where the 1440x900 board sits on screen. */
  const PX = { k: 0.01, ox: 0, oy: 0, s: 1 }
  const color = (name: PaletteToken) => new THREE.Color(token(name))

  const U = {
    uTime: { value: 0 },
    uA: { value: 0 },
    uB: { value: 0 },
    uMix: { value: 1 },
    uAmp: { value: 0.18 },
    uTwist: { value: 0 },
    uPx: { value: 20 * renderer.getPixelRatio() },
    uCa: { value: color('purple-500') },
    uCb: { value: color('magenta-500') },
    uCc: { value: color('blue-500') },
    uAlpha: { value: 1 },
  }
  const surfMat = new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: SURFACE_VERT,
    fragmentShader: SURFACE_FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  })
  const ptsMat = new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: SURFACE_VERT,
    fragmentShader: SKIN_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const surface = new THREE.Mesh(new THREE.SphereGeometry(1, 120, 72), surfMat)
  const skin = new THREE.Points(new THREE.SphereGeometry(1, 64, 40), ptsMat)
  surface.frustumCulled = false
  skin.frustumCulled = false
  const signalGroup = new THREE.Group()
  const spin = new THREE.Group()
  spin.add(surface, skin)
  signalGroup.add(spin)
  scene.add(signalGroup)

  /* structured particle field: one layout per scene, morphed on the GPU */
  const LAYOUTS = createLayouts()
  const first = LAYOUTS[0] ?? new Float32Array(FIELD_COUNT * 3)
  const pgeo = new THREE.BufferGeometry()
  pgeo.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(FIELD_COUNT * 3), 3),
  )
  const fromAttr = new THREE.BufferAttribute(first.slice(), 3)
  const toAttr = new THREE.BufferAttribute(first.slice(), 3)
  pgeo.setAttribute('aFrom', fromAttr)
  pgeo.setAttribute('aTo', toAttr)
  const seeds = new Float32Array(FIELD_COUNT)
  for (let i = 0; i < FIELD_COUNT; i++) seeds[i] = rnd(i, 22)
  pgeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
  const fieldU = {
    uT: { value: 1 },
    uTime: U.uTime,
    uSize: { value: 32 * renderer.getPixelRatio() },
    uCol: { value: color('purple-400') },
    uCol2: { value: color('magenta-500') },
    uBoard: { value: new THREE.Vector4(0, 0, 1, 0.01) },
    uView: { value: new THREE.Vector2(1, 1) },
  }
  const fieldMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: fieldU,
    vertexShader: FIELD_VERT,
    fragmentShader: FIELD_FRAG,
  })
  const field = new THREE.Points(pgeo, fieldMat)
  field.frustumCulled = false
  scene.add(field)

  /** Screen point to world (z = 0 plane, ignoring the small camera parallax). */
  const toWorld = (sx: number, sy: number): [number, number] => [
    (sx - window.innerWidth / 2) * PX.k,
    -(sy - window.innerHeight / 2) * PX.k,
  ]

  /* Newton's cradle: five chrome balls on the Start scene */
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
  /** One unit sphere for the cradle balls and the partner spheres. */
  const ballGeo = new THREE.SphereGeometry(1, 40, 28)
  const CR = { len: 4.2, gap: 2.04, depth: 0.9, appear: 0 }
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
  cradleRig.rotation.set(0.18, -0.42, 0)
  cradle.visible = false
  scene.add(cradle)
  const cradleSlot = must({ root, selector: '#cradleSlot', type: HTMLElement })
  let cradleRect = cradleSlot.getBoundingClientRect()
  const updateCradle = (t: number) => {
    const sw = Math.sin(t * 3.1)
    const A = 0.6
    /* the end balls swing out on their own side; the middle three only shiver */
    const end = cradleBalls.length - 1
    cradleBalls.forEach((b, i) => {
      const a =
        i === 0
          ? Math.min(sw, 0) * A
          : i === end
            ? Math.max(sw, 0) * A
            : sw * 0.05 * A
      b.position.set(
        (i - 2) * CR.gap + Math.sin(a) * CR.len,
        -Math.cos(a) * CR.len,
        0,
      )
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
  const placeCradle = () => {
    const r = cradleRect
    const unit = r.width / (CR.gap * 4 + 2.4)
    const [x, y] = toWorld(r.left + r.width / 2, r.top + 8)
    cradle.position.set(x, y, 1.2)
    cradle.scale.setScalar(unit * PX.k * CR.appear)
  }

  /* partner spheres: inflated rubber balls with their own physics, pushed and thrown by the cursor */
  const hemi = new THREE.HemisphereLight(
    color('white'),
    color('purple-900'),
    0.95,
  )
  const key = new THREE.DirectionalLight(color('white'), 1.05)
  key.position.set(-3, 4, 6)
  const rimLight = new THREE.PointLight(color('magenta-500'), 0.9, 40)
  rimLight.position.set(5, -3, 4)
  scene.add(hemi, key, rimLight)
  const markTex = ({ bg, fg, label }: PartnerMark) => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 256
    const x = c.getContext('2d')
    if (x) {
      x.fillStyle = token(bg)
      x.fillRect(0, 0, 512, 256)
      x.fillStyle = token(fg)
      x.strokeStyle = token(fg)
      x.lineWidth = 6
      x.textAlign = 'center'
      x.textBaseline = 'middle'
      x.font = `700 ${label.length > 4 ? 34 : 48}px ${getComputedStyle(root).getPropertyValue('--font-display') || 'sans-serif'}`
      for (const cx of [128, 384]) {
        x.beginPath()
        x.arc(cx, 128, 74, 0, Math.PI * 2)
        x.stroke()
        x.fillText(label, cx, 130)
      }
    }
    const t = new THREE.CanvasTexture(c)
    t.anisotropy = 4
    return t
  }
  const markMats = PARTNER_MARKS.map(
    (m) =>
      new THREE.MeshPhysicalMaterial({
        map: markTex(m),
        roughness: 0.34,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
      }),
  )
  const partners = new THREE.Group()
  partners.visible = false
  scene.add(partners)
  const PB: Ball[] = []
  for (let i = 0; i < 30; i++) {
    const m = new THREE.Mesh(ballGeo, markMats[i % markMats.length])
    const r = 0.55 + rnd(i, 40) * 0.45
    m.scale.setScalar(r)
    m.rotation.set(rnd(i, 41) * 6, rnd(i, 42) * 6, 0)
    partners.add(m)
    PB.push({ m, r, p: new THREE.Vector3(), v: new THREE.Vector3() })
  }
  const PZ: {
    unit: number
    appear: number
    pointer: Three.Vector3 | null
    grab: Ball | null
  } = { unit: 1, appear: 0, pointer: null, grab: null }
  const scatterPartners = () => {
    PB.forEach((b, i) => {
      const a = rnd(i, 43) * Math.PI * 2
      b.p.set(Math.cos(a) * 6.5, Math.sin(a) * 5.5, (rnd(i, 44) - 0.5) * 4)
      b.v.set(-Math.cos(a) * 4, -Math.sin(a) * 4, 0)
    })
  }
  scatterPartners()
  const zone = must({ root, selector: '#partnerZone', type: HTMLElement })
  let zoneRect = zone.getBoundingClientRect()
  /** Slot rects are read once per layout change instead of on every frame. */
  const measure = () => {
    cradleRect = cradleSlot.getBoundingClientRect()
    zoneRect = zone.getBoundingClientRect()
  }
  const slotWatch = new ResizeObserver(measure)
  for (const el of [cradleSlot, zone]) {
    slotWatch.observe(el)
    if (el.parentElement) slotWatch.observe(el.parentElement)
  }
  const placePartners = () => {
    const r = zoneRect
    PZ.unit = Math.min(r.width, r.height) / 2 / 4.8
    const [x, y] = toWorld(r.left + r.width / 2, r.top + r.height / 2)
    partners.position.set(x, y, 0)
    partners.scale.setScalar(PZ.unit * PX.k * PZ.appear)
  }
  const raycaster = new THREE.Raycaster()
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  const hit = new THREE.Vector3()
  const ndc = new THREE.Vector2()
  /** The pointer in the partner group's space; one vector reused for every event. */
  const local = new THREE.Vector3()
  const pointerLocal = (e: PointerEvent) => {
    ndc.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1,
    )
    raycaster.setFromCamera(ndc, camera)
    if (!raycaster.ray.intersectPlane(plane, hit)) return null
    const s = partners.scale.x || 1
    return local.set(
      (hit.x - partners.position.x) / s,
      (hit.y - partners.position.y) / s,
      0,
    )
  }
  zone.addEventListener(
    'pointermove',
    (e) => {
      PZ.pointer = pointerLocal(e)
    },
    { signal },
  )
  zone.addEventListener(
    'pointerleave',
    () => {
      if (!PZ.grab) PZ.pointer = null
    },
    { signal },
  )
  zone.addEventListener(
    'pointerdown',
    (e) => {
      const q = pointerLocal(e)
      if (!q) return
      let best: Ball | null = null
      let bd = Number.POSITIVE_INFINITY
      for (const b of PB) {
        const d = Math.hypot(b.p.x - q.x, b.p.y - q.y)
        if (d < b.r * 1.15 && d < bd) {
          bd = d
          best = b
        }
      }
      if (best) {
        PZ.grab = best
        zone.setPointerCapture(e.pointerId)
        state.dragging = true
      }
      PZ.pointer = q
    },
    { signal },
  )
  const release = () => {
    PZ.grab = null
    state.dragging = false
  }
  zone.addEventListener('pointerup', release, { signal })
  zone.addEventListener('pointercancel', release, { signal })
  const stepPartners = (dt: number) => {
    for (const b of PB) {
      b.v.addScaledVector(b.p, -3.2 * dt)
      b.v.multiplyScalar(Math.exp(-2.2 * dt))
      if (PZ.grab === b && PZ.pointer)
        b.v.set(
          (PZ.pointer.x - b.p.x) * 14,
          (PZ.pointer.y - b.p.y) * 14,
          -b.p.z * 4,
        )
      else if (PZ.pointer) {
        const dx = b.p.x - PZ.pointer.x
        const dy = b.p.y - PZ.pointer.y
        const d = Math.hypot(dx, dy) || 1e-4
        const min = b.r + 1.1
        if (d < min) {
          const push = (min - d) / d
          b.p.x += dx * push * 0.5
          b.p.y += dy * push * 0.5
          b.v.x += dx * push * 9
          b.v.y += dy * push * 9
        }
      }
    }
    collideBalls({ balls: PB, dims: 3, bounce: 1.5 })
    for (const b of PB) {
      b.p.addScaledVector(b.v, dt)
      b.p.z = Math.max(-2.5, Math.min(2.5, b.p.z))
      b.m.position.copy(b.p)
      b.m.rotation.y += (b.v.x * dt) / b.r
      b.m.rotation.x -= (b.v.y * dt) / b.r
      const sq = 1 + Math.min(0.12, b.v.length() * 0.006)
      b.m.scale.set(b.r * sq, b.r / sq, b.r * sq)
    }
  }

  const tw = { amp: 0.2 }
  const rgb = (name: PaletteToken) => {
    const c = color(name)
    return { r: c.r, g: c.g, b: c.b }
  }
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
      /* point sizes are in framebuffer pixels: keep particles the same size on screen */
      U.uPx.value = 20 * dpr
      fieldU.uSize.value = 32 * dpr
      slow = 0
    }
    timer.update(now)
    const t = timer.getElapsed()
    U.uTime.value = t
    U.uAmp.value = tw.amp
    if (cradle.visible) {
      updateCradle(t)
      placeCradle()
    }
    if (partners.visible) {
      const dt = Math.min(0.033, frameDt)
      stepPartners(dt * 0.5)
      stepPartners(dt * 0.5)
      placePartners()
    }
    spin.rotation.y = t * 0.16 + pointer.nx * 0.5
    spin.rotation.x = pointer.ny * 0.3
    camera.position.x += (pointer.nx * 0.35 - camera.position.x) * 0.04
    camera.position.y += (-pointer.ny * 0.25 - camera.position.y) * 0.04
    camera.lookAt(camera.position.x * 0.6, camera.position.y * 0.6, 0)
    renderer.render(scene, camera)
  }

  let current = 0
  /** Scratch buffer for the field frozen mid-morph, reused by every scene change. */
  const frozen = new Float32Array(FIELD_COUNT * 3)
  const place = (i: number, dur = 1.6) => {
    const L = LOOK[i]
    if (!L) return
    const w = window.innerWidth
    const h = window.innerHeight
    const mob = isMobile()
    const sx = mob ? w * MOBILE_LOOK.x : PX.ox + L.x * PX.s
    const sy = mob ? h * MOBILE_LOOK.y : PX.oy + L.y * PX.s
    const size = mob ? w * MOBILE_LOOK.size : L.size * PX.s
    const sc = (size / 2) * PX.k
    gsap.to(signalGroup.position, {
      x: (sx - w / 2) * PX.k,
      y: -(sy - h / 2) * PX.k,
      duration: dur,
      ease: 'expo.inOut',
    })
    gsap.to(signalGroup.scale, {
      x: sc,
      y: sc,
      z: sc,
      duration: dur,
      ease: 'expo.inOut',
    })
    gsap.to(signalGroup.rotation, {
      x: L.rx,
      z: L.rz ?? 0,
      duration: dur,
      ease: 'power3.inOut',
    })
  }
  const go = (i: number, dur = 1.6) => {
    const L = LOOK[i]
    const layout = LAYOUTS[i]
    if (!L || !layout) return
    current = i
    measure()
    place(i, dur)
    if (L.cradle) {
      cradle.visible = true
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
    if (L.partners) {
      partners.visible = true
      scatterPartners()
      PZ.appear = 0
      gsap.to(PZ, { appear: 1, duration: 1.2, delay: 0.3, ease: 'expo.out' })
    } else
      gsap.to(PZ, {
        appear: 0,
        duration: 0.4,
        onComplete: () => {
          partners.visible = false
        },
      })
    if (U.uMix.value > 0.5) U.uA.value = U.uB.value
    U.uB.value = L.shape
    U.uMix.value = 0
    gsap.to(U.uMix, { value: 1, duration: dur * 1.15, ease: 'power2.inOut' })
    gsap.to(U.uTwist, { value: L.twist, duration: dur })
    gsap.to(tw, { amp: L.amp, duration: dur })
    gsap.to(U.uCa.value, { ...rgb(L.c[0]), duration: dur })
    gsap.to(U.uCb.value, { ...rgb(L.c[1]), duration: dur })
    gsap.to(U.uCc.value, { ...rgb(L.c[2]), duration: dur })
    /* freeze the field where it is now, then morph from there to the next layout */
    const from = fromAttr.array
    const to = toAttr.array
    const tt = fieldU.uT.value
    const cur = frozen
    for (let k = 0; k < FIELD_COUNT; k++) {
      const e = Math.min(Math.max(tt * 1.4 - (seeds[k] ?? 0) * 0.4, 0), 1)
      const s = e * e * (3 - 2 * e)
      for (let c = 0; c < 3; c++) {
        const n = k * 3 + c
        const a = from[n] ?? 0
        cur[n] = a + ((to[n] ?? 0) - a) * s
      }
    }
    fromAttr.copyArray(cur)
    fromAttr.needsUpdate = true
    toAttr.copyArray(layout)
    toAttr.needsUpdate = true
    fieldU.uT.value = 0
    gsap.to(fieldU.uT, { value: 1, duration: dur * 1.25, ease: 'power2.inOut' })
  }
  const retheme = () => {
    const light = isLightTheme()
    for (const m of [surfMat, ptsMat, fieldMat]) {
      m.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending
      m.needsUpdate = true
    }
    U.uAlpha.value = light ? 0.75 : 1
    chromeU.uBase.value.set(token(light ? 'neutral-400' : 'neutral-700'))
    hemi.intensity = light ? 1.15 : 0.95
    fieldU.uCol.value.set(token(light ? 'purple-500' : 'purple-400'))
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
    fieldU.uBoard.value.set(PX.ox, PX.oy, s, PX.k)
    fieldU.uView.value.set(w, h)
    measure()
    /* without the loop, setSize() leaves a blank canvas: place instantly and redraw */
    place(current, looping ? 0.01 : 0)
    if (!looping) still()
  }
  window.addEventListener('resize', resize, { signal })
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
      slotWatch.disconnect()
      gsap.killTweensOf([
        signalGroup.position,
        signalGroup.scale,
        signalGroup.rotation,
        CR,
        PZ,
        tw,
        U.uMix,
        U.uTwist,
        U.uCa.value,
        U.uCb.value,
        U.uCc.value,
        fieldU.uT,
      ])
      scene.traverse((o) => {
        if (
          o instanceof THREE.Mesh ||
          o instanceof THREE.Points ||
          o instanceof THREE.Line
        )
          o.geometry.dispose()
      })
      for (const m of markMats) {
        m.map?.dispose()
        m.dispose()
      }
      for (const m of [surfMat, ptsMat, fieldMat, chromeMat, stringMat])
        m.dispose()
      renderer.dispose()
    },
  }
}
