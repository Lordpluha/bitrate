import { gsap } from 'gsap'
import type * as Three from 'three'
import { type EngineContext, must, rnd } from '../context'
import { PARTNER_MARKS, type PartnerMark } from '../marks'
import { token } from '../palette'
import { collideBalls } from '../physics'
import type { StageKit } from './types'

type Ball = { m: Three.Mesh; r: number; p: Three.Vector3; v: Three.Vector3 }

/** Partner spheres: inflated rubber balls with their own physics, pushed and thrown by the cursor. */
export const createPartners = ({
  kit,
  ctx,
  camera,
  ballGeo,
}: {
  kit: StageKit
  ctx: EngineContext
  /** Pointer events are cast through it onto the spheres' plane. */
  camera: Three.Camera
  /** The unit sphere shared with the cradle. */
  ballGeo: Three.SphereGeometry
}) => {
  const { THREE, scene, color, board: PX, toWorld } = kit
  const { root, state, signal } = ctx
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
  /** The zone rect is read once per layout change instead of on every frame. */
  let zoneRect = zone.getBoundingClientRect()
  const measure = () => {
    zoneRect = zone.getBoundingClientRect()
  }
  const zoneWatch = new ResizeObserver(measure)
  zoneWatch.observe(zone)
  if (zone.parentElement) zoneWatch.observe(zone.parentElement)
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

  return {
    measure,
    /** Per frame while on screen: two physics sub-steps, then follow the zone. */
    frame: (frameDt: number) => {
      if (!partners.visible) return
      const dt = Math.min(0.033, frameDt)
      stepPartners(dt * 0.5)
      stepPartners(dt * 0.5)
      placePartners()
    },
    /** Throws the spheres in from the edges on their scene, shrinks them away on every other. */
    show: (on: boolean) => {
      if (on) {
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
    },
    retheme: (light: boolean) => {
      hemi.intensity = light ? 1.15 : 0.95
    },
    tweenTargets: [PZ],
    dispose: () => {
      zoneWatch.disconnect()
      for (const m of markMats) {
        m.map?.dispose()
        m.dispose()
      }
    },
  }
}
