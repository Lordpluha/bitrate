import { BOARD, rnd } from './context'

/** Particles in the structured field. */
export const FIELD_COUNT = 2400

type Point = readonly [number, number, number]

const make = (fn: (i: number, f: number) => Point) => {
  const a = new Float32Array(FIELD_COUNT * 3)
  for (let i = 0; i < FIELD_COUNT; i++) {
    const [x, y, z] = fn(i, i / FIELD_COUNT)
    a[i * 3] = x
    a[i * 3 + 1] = y
    a[i * 3 + 2] = z
  }
  return a
}
const GOLD = Math.PI * (3 - Math.sqrt(5))
const fib = ({
  i,
  n,
  r,
  cx,
  cy,
  hemi = false,
}: {
  i: number
  n: number
  r: number
  cx: number
  cy: number
  hemi?: boolean
}): Point => {
  const y = hemi ? i / n : 1 - (i / (n - 1)) * 2
  const rad = Math.sqrt(Math.max(0, 1 - y * y))
  const t = GOLD * i
  return [cx + Math.cos(t) * rad * r, cy - y * r, Math.sin(t) * rad * r]
}
const ellipse = ({
  t,
  cx,
  cy,
  rx,
  ry,
  tilt = 0,
}: {
  t: number
  cx: number
  cy: number
  rx: number
  ry: number
  tilt?: number
}): Point => {
  const y = Math.sin(t) * ry
  return [
    cx + Math.cos(t) * rx,
    cy + y * Math.cos(tilt),
    y * Math.sin(tilt) * 2,
  ]
}
const rect = ({
  x,
  y,
  w,
  h,
  t,
}: {
  x: number
  y: number
  w: number
  h: number
  t: number
}): [number, number] => {
  let d = t * 2 * (w + h)
  if (d < w) return [x + d, y]
  d -= w
  if (d < h) return [x + w, y + d]
  d -= h
  if (d < w) return [x + w - d, y + h]
  d -= w
  return [x, y + h - d]
}

const TAU = Math.PI * 2

/** One particle layout per scene (same order as LANDING_SCENES), in board pixels (x, y, depth). */
export const createLayouts = (): Float32Array[] => [
  /* 01 fibonacci shell around the signal + two tilted orbits */
  make((i, f) =>
    f < 0.62
      ? fib({ i, n: Math.floor(FIELD_COUNT * 0.62), r: 430, cx: 1000, cy: 455 })
      : ellipse({
          t: i * 0.37,
          cx: 1000,
          cy: 455,
          rx: 560,
          ry: 150,
          tilt: f < 0.81 ? 0.9 : -0.6,
        }),
  ),
  /* 02 a 72-band spectrum along the floor + a signal line over the player blocks */
  make((i, f) => {
    if (f < 0.7) {
      const bar = i % 72
      const h =
        (Math.sin(bar * 0.45) * 0.5 + 0.5) *
        (Math.sin(bar * 0.13 + 1) * 0.4 + 0.6) *
        160
      return [40 + bar * 19.5, 884 - rnd(i, 1) * h, (rnd(i, 2) - 0.5) * 40]
    }
    const x = rnd(i, 3) * BOARD.width
    return [x, 230 + Math.sin(x * 0.02) * 12, (rnd(i, 4) - 0.5) * 60]
  }),
  /* 03 four concentric orbits around the playlist and its queue */
  make((i) => {
    const ring = i % 4
    return ellipse({
      t: rnd(i, 10) * TAU,
      cx: 930,
      cy: 520,
      rx: 170 + ring * 110,
      ry: 60 + ring * 40,
      tilt: 0.7 + ring * 0.12,
    })
  }),
  /* 04 a perspective floor grid running to the horizon */
  make((i) => {
    const cols = 64
    const row = Math.floor(i / cols) % 50
    const col = i % cols
    return [col * (BOARD.width / (cols - 1)), 650 + row * 5, -900 + row * 26]
  }),
  /* 05 three stacked rings behind the library grid */
  make((i) => {
    const k = i % 3
    return ellipse({
      t: rnd(i, 11) * TAU,
      cx: 1250,
      cy: 470 + k * 95,
      rx: 150 - k * 18,
      ry: 34,
      tilt: 1.15,
    })
  }),
  /* 06 outlines of the browse grid and the artists column, with a loose cloud between them */
  make((i, f) => {
    if (f < 0.5) {
      const [x, y] = rect({ x: 48, y: 300, w: 900, h: 430, t: rnd(i, 12) })
      return [x, y, (rnd(i, 13) - 0.5) * 30]
    }
    if (f < 0.8) {
      const [x, y] = rect({ x: 972, y: 130, w: 420, h: 600, t: rnd(i, 14) })
      return [x, y, (rnd(i, 15) - 0.5) * 30]
    }
    const r = 40 + rnd(i, 22) * 120
    const t = rnd(i, 27) * TAU
    return [830 + Math.cos(t) * r, 160 + Math.sin(t) * r * 0.6, 0]
  }),
  /* 07 outlines of the desktop window and the phone, joined by an arc */
  make((i, f) => {
    if (f < 0.45) {
      const [x, y] = rect({ x: 560, y: 116, w: 848, h: 716, t: rnd(i, 16) })
      return [x, y, 0]
    }
    if (f < 0.75) {
      const [x, y] = rect({ x: 352, y: 196, w: 300, h: 600, t: rnd(i, 17) })
      return [x, y, 20]
    }
    const t = rnd(i, 18)
    return [502 + 200 * t + Math.sin(t * 3.1) * 30, 790 - 150 * t * t, 10]
  }),
  /* 08 conversation ripples from the Online now card */
  make((i) => {
    const ring = i % 9
    const t = (rnd(i, 19) - 0.5) * Math.PI * 1.2
    const r = 70 + ring * 70
    return [
      213 + Math.cos(t) * r,
      558 + Math.sin(t) * r,
      (rnd(i, 20) - 0.5) * 20,
    ]
  }),
  /* 09 a loose shell around the partner spheres */
  make((i) => fib({ i, n: FIELD_COUNT, r: 470, cx: 970, cy: 460 })),
  /* 10 gravity rain over the team pit + its floor line */
  make((i, f) =>
    f < 0.75
      ? [
          520 + Math.floor(rnd(i, 23) * 44) * 20,
          70 + rnd(i, 24) * 780,
          (rnd(i, 25) - 0.5) * 30,
        ]
      : [520 + rnd(i, 26) * 880, 849, 0],
  ),
  /* 11 a dome lattice rising from the footer + a wide halo */
  make((i, f) =>
    f < 0.7
      ? fib({
          i,
          n: Math.floor(FIELD_COUNT * 0.7),
          r: 560,
          cx: 720,
          cy: 900,
          hemi: true,
        })
      : ellipse({
          t: rnd(i, 21) * TAU,
          cx: 720,
          cy: 800,
          rx: 700,
          ry: 90,
          tilt: 1.2,
        }),
  ),
]
