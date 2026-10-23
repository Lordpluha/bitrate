import { gsap } from 'gsap'
import type * as Three from 'three'
import { token } from '../palette'
import { CHROME_FRAG, CHROME_VERT } from '../shaders'
import type { StageKit } from './types'

/** Newton's cradle: five chrome balls on the Start scene, hung over its `#cradleSlot`. */
export const createCradle = ({
  kit,
  ballGeo,
  slot,
}: {
  kit: StageKit
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

  /** The slot rect is read once per layout change instead of on every frame. */
  let rect = slot.getBoundingClientRect()
  const measure = () => {
    rect = slot.getBoundingClientRect()
  }
  const slotWatch = new ResizeObserver(measure)
  slotWatch.observe(slot)
  if (slot.parentElement) slotWatch.observe(slot.parentElement)

  const swing = (t: number) => {
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
  const place = () => {
    const r = rect
    const unit = r.width / (CR.gap * 4 + 2.4)
    const [x, y] = toWorld(r.left + r.width / 2, r.top + 8)
    cradle.position.set(x, y, 1.2)
    cradle.scale.setScalar(unit * PX.k * CR.appear)
  }

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
