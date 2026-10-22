import { gsap } from 'gsap'
import { rnd } from '../context'
import { FIELD_COUNT } from '../layouts'
import { token } from '../palette'
import { FIELD_FRAG, FIELD_MORPH, FIELD_VERT } from '../shaders'
import type { BoardFit, StageKit, Uniform } from './types'

/** The structured particle field: one layout per scene, morphed on the GPU. */
export const createField = ({
  kit,
  first,
  pixelRatio,
  time,
}: {
  kit: StageKit
  /** The layout the field starts in. */
  first: Float32Array
  pixelRatio: number
  /** The signal's clock uniform. */
  time: Uniform<number>
}) => {
  const { THREE, scene, color } = kit
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
    uTime: time,
    uSize: { value: 32 * pixelRatio },
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

  /** Scratch buffer for the field frozen mid-morph, reused by every scene change. */
  const frozen = new Float32Array(FIELD_COUNT * 3)
  /** Freezes the field where it is now (the CPU copy of FIELD_VERT's morph), then morphs to `layout`. */
  const morphTo = (layout: Float32Array, dur: number) => {
    const from = fromAttr.array
    const to = toAttr.array
    const tt = fieldU.uT.value
    for (let k = 0; k < FIELD_COUNT; k++) {
      const e = Math.min(
        Math.max(
          tt * FIELD_MORPH.speed - (seeds[k] ?? 0) * FIELD_MORPH.spread,
          0,
        ),
        1,
      )
      const s = e * e * (3 - 2 * e)
      for (let c = 0; c < 3; c++) {
        const n = k * 3 + c
        const a = from[n] ?? 0
        frozen[n] = a + ((to[n] ?? 0) - a) * s
      }
    }
    fromAttr.copyArray(frozen)
    fromAttr.needsUpdate = true
    toAttr.copyArray(layout)
    toAttr.needsUpdate = true
    fieldU.uT.value = 0
    gsap.to(fieldU.uT, { value: 1, duration: dur * 1.25, ease: 'power2.inOut' })
  }

  return {
    morphTo,
    /** Where the board sits on screen, for the vertex shader's board-to-world mapping. */
    fit: (board: BoardFit, w: number, h: number) => {
      fieldU.uBoard.value.set(board.ox, board.oy, board.s, board.k)
      fieldU.uView.value.set(w, h)
    },
    /** Point sizes are in framebuffer pixels: keep them the same size on screen. */
    setPixelRatio: (dpr: number) => {
      fieldU.uSize.value = 32 * dpr
    },
    retheme: (light: boolean) => {
      fieldMat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending
      fieldMat.needsUpdate = true
      fieldU.uCol.value.set(token(light ? 'purple-500' : 'purple-400'))
    },
    tweenTargets: [fieldU.uT],
    dispose: () => fieldMat.dispose(),
  }
}
