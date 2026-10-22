import { LUMA } from '../layouts'
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
export const MOBILE_LOOK = { x: 0.8, y: 0.14, size: 0.42 }
