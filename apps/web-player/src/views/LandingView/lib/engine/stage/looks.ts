import type { SceneId } from '../../../model/scenes'
import type { PaletteToken } from '../palette'

/** How the signal looks in one scene. */
export type Look = {
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
export const LOOK: Readonly<Record<SceneId, Look>> = {
  hero: {
    shape: 0,
    x: 1000,
    y: 455,
    size: 560,
    rx: 0.2,
    amp: 0.2,
    twist: 0,
    c: ['purple-500', 'magenta-500', 'blue-500'],
  },
  loop: {
    shape: 2,
    x: 1010,
    y: 120,
    size: 140,
    rx: 0.5,
    amp: 0.08,
    twist: 0,
    c: ['purple-500', 'purple-400', 'magenta-500'],
  },
  rules: {
    shape: 3,
    x: 230,
    y: 830,
    size: 240,
    rx: 1.15,
    amp: 0.03,
    twist: 0,
    c: ['purple-500', 'magenta-500', 'purple-400'],
  },
  library: {
    shape: 6,
    x: 990,
    y: 120,
    size: 140,
    rx: 0,
    rz: 1.5708,
    amp: 0.06,
    twist: 0,
    c: ['purple-400', 'blue-500', 'magenta-500'],
  },
  devices: {
    shape: 1,
    x: 150,
    y: 800,
    size: 240,
    rx: 1.0,
    amp: 0.2,
    twist: 2.4,
    c: ['purple-500', 'green-500', 'blue-500'],
  },
  social: {
    shape: 0,
    x: 220,
    y: 790,
    size: 220,
    rx: 0,
    amp: 0.42,
    twist: 0.8,
    c: ['magenta-500', 'purple-500', 'blue-500'],
  },
  partners: {
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
  team: {
    shape: 0,
    x: 1300,
    y: 150,
    size: 120,
    rx: 0,
    amp: 0.35,
    twist: 0,
    c: ['purple-400', 'blue-500', 'magenta-500'],
  },
  faq: {
    shape: 3,
    x: 270,
    y: 640,
    size: 220,
    rx: 0.6,
    amp: 0.08,
    twist: 0,
    c: ['purple-400', 'blue-500', 'magenta-500'],
  },
  cta: {
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
}
/** On phones the signal sits in the top-right corner, as a share of the viewport. */
export const MOBILE_LOOK = { x: 0.8, y: 0.14, size: 0.42 }
