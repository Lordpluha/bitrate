import { gsap } from 'gsap'
import { isMobile, type PointerStore } from '../context'
import type { PaletteToken } from '../palette'
import { SKIN_FRAG, SURFACE_FRAG, SURFACE_VERT } from '../shaders'
import { type Look, MOBILE_LOOK } from './looks'
import { planMorph } from './morphPlan'
import type { StageKit } from './types'

/** Shortest leg of a reversed or resumed morph, so it never looks like a cut. */
const MIN_LEG = 0.35
/** How long an unfinished morph takes to settle before the next one starts. */
const CHAIN_S = 0.4

/** The morphing signal: one parametric surface and its point skin, in a group the scenes move. */
export const createSignal = ({
  kit,
  pixelRatio,
}: {
  kit: StageKit
  pixelRatio: number
}) => {
  const { THREE, scene, color, board: PX } = kit
  const U = {
    uTime: { value: 0 },
    uA: { value: 0 },
    uB: { value: 0 },
    uMix: { value: 1 },
    uAmp: { value: 0.18 },
    uTwist: { value: 0 },
    uPx: { value: 20 * pixelRatio },
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

  const tw = { amp: 0.2 }
  const rgb = (name: PaletteToken) => {
    const c = color(name)
    return { r: c.r, g: c.g, b: c.b }
  }

  /** Moves the signal to a scene's spot on the board (a corner of the screen on phones). */
  const place = (L: Look, dur: number) => {
    /* a move that interrupts another keeps its speed instead of stopping dead and starting over */
    const moving = gsap.isTweening(signalGroup.position)
    const ease = moving ? 'power3.out' : 'expo.inOut'
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
      ease,
      overwrite: 'auto',
    })
    gsap.to(signalGroup.scale, {
      x: sc,
      y: sc,
      z: sc,
      duration: dur,
      ease,
      overwrite: 'auto',
    })
    gsap.to(signalGroup.rotation, {
      x: L.rx,
      z: L.rz ?? 0,
      duration: dur,
      ease: moving ? 'power3.out' : 'power3.inOut',
      overwrite: 'auto',
    })
  }

  /** Morphs shape, twist, noise and palette towards a scene's look. */
  const morphTo = (L: Look, dur: number) => {
    const full = dur * 1.15
    const mix = U.uMix.value
    const start = () => {
      U.uA.value = U.uB.value
      U.uB.value = L.shape
      U.uMix.value = 0
      gsap.to(U.uMix, {
        value: 1,
        duration: full,
        ease: 'power2.inOut',
        overwrite: true,
      })
    }
    switch (planMorph({ a: U.uA.value, b: U.uB.value, mix }, L.shape)) {
      case 'reverse':
        /* back to where it came from: the same morph, played backwards from where it is */
        gsap.to(U.uMix, {
          value: 0,
          duration: Math.max(MIN_LEG, full * mix),
          ease: 'power2.inOut',
          overwrite: true,
          onComplete: () => {
            U.uB.value = U.uA.value
            U.uMix.value = 1
          },
        })
        break
      case 'continue':
        if (mix < 1)
          gsap.to(U.uMix, {
            value: 1,
            duration: Math.max(MIN_LEG, full * (1 - mix)),
            ease: 'power2.out',
            overwrite: true,
          })
        break
      case 'chain':
        /* settle the current morph first, so the new one starts from a real shape */
        gsap.to(U.uMix, {
          value: 1,
          duration: CHAIN_S * (1 - mix),
          ease: 'power1.out',
          overwrite: true,
          onComplete: start,
        })
        break
      case 'start':
        start()
    }
    const soft = { duration: dur, overwrite: 'auto' } as const
    gsap.to(U.uTwist, { value: L.twist, ...soft })
    gsap.to(tw, { amp: L.amp, ...soft })
    gsap.to(U.uCa.value, { ...rgb(L.c[0]), ...soft })
    gsap.to(U.uCb.value, { ...rgb(L.c[1]), ...soft })
    gsap.to(U.uCc.value, { ...rgb(L.c[2]), ...soft })
  }

  return {
    /** Shared clock uniform (the particle field reads it too). */
    time: U.uTime,
    place,
    morphTo,
    /** Per frame: clock, noise amplitude and the pointer-driven spin. */
    frame: (t: number, pointer: PointerStore) => {
      U.uTime.value = t
      U.uAmp.value = tw.amp
      spin.rotation.y = t * 0.16 + pointer.nx * 0.5
      spin.rotation.x = pointer.ny * 0.3
    },
    /** Point sizes are in framebuffer pixels: keep them the same size on screen. */
    setPixelRatio: (dpr: number) => {
      U.uPx.value = 20 * dpr
    },
    retheme: (light: boolean) => {
      for (const m of [surfMat, ptsMat]) {
        m.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending
        m.needsUpdate = true
      }
      U.uAlpha.value = light ? 0.75 : 1
    },
    tweenTargets: [
      signalGroup.position,
      signalGroup.scale,
      signalGroup.rotation,
      tw,
      U.uMix,
      U.uTwist,
      U.uCa.value,
      U.uCb.value,
      U.uCc.value,
    ],
    dispose: () => {
      surfMat.dispose()
      ptsMat.dispose()
    },
  }
}
