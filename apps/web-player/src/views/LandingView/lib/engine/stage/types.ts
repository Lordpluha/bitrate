import type * as Three from 'three'
import type { PaletteToken } from '../palette'

/** The lazily imported Three.js module. */
type ThreeModule = typeof Three

/** k: world units per screen pixel; ox/oy/s: where the 1440x900 board sits on screen. */
export type BoardFit = { k: number; ox: number; oy: number; s: number }

/** What every stage part builds with: Three.js, the scene and the shared screen mapping. */
export type StageKit = {
  THREE: ThreeModule
  scene: Three.Scene
  /** A palette token as a Three.js colour. */
  color: (name: PaletteToken) => Three.Color
  /** Updated in place on every resize. */
  board: BoardFit
  /** Screen point to world (z = 0 plane, ignoring the small camera parallax). */
  toWorld: (sx: number, sy: number) => [number, number]
}

/** A uniform shared between materials. */
export type Uniform<T> = { value: T }
