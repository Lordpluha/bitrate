/** Newton's cradle geometry in rig units: ball radius 1, pivots `GAP` apart, strings `LEN` long. */
export const CRADLE = { len: 4.2, gap: 2.04, count: 5 } as const

/** Swing angle (radians, positive to the right) and angular speed of each ball. */
export type CradleState = { a: number[]; w: number[] }

/** g / L, tuned so a swing takes about as long as the landing's old scripted one. */
const STIFFNESS = 9.6
/** Air friction: low, so a push keeps the cradle clicking for a long while. */
const DAMPING = 0.04
/** Energy kept in a click between balls. */
const RESTITUTION = 0.995
const DIAMETER = 2
const PASSES = 6

/** A ball's centre along the row, in rig units. */
export const cradleX = (s: CradleState, i: number) =>
  (i - (CRADLE.count - 1) / 2) * CRADLE.gap + Math.sin(s.a[i] ?? 0) * CRADLE.len

/** The angle that puts ball `i` at row position `x` (clamped to a swing the strings allow). */
export const angleFor = (i: number, x: number) => {
  const pivot = (i - (CRADLE.count - 1) / 2) * CRADLE.gap
  return Math.asin(Math.max(-0.95, Math.min(0.95, (x - pivot) / CRADLE.len)))
}

/**
 * One step of the cradle: each ball is a pendulum; touching balls push apart and, when closing
 * in, trade their speeds (equal masses), which is what carries a click through the row.
 * A grabbed ball sits where the pointer holds it and shoves its neighbours aside.
 */
export const stepCradle = ({
  s,
  dt,
  grab,
}: {
  s: CradleState
  dt: number
  grab?: { i: number; a: number }
}) => {
  const n = CRADLE.count
  for (let i = 0; i < n; i++) {
    if (grab?.i === i) {
      s.a[i] = grab.a
      s.w[i] = 0
      continue
    }
    const a = s.a[i] ?? 0
    const w =
      (s.w[i] ?? 0) + (-STIFFNESS * Math.sin(a) - DAMPING * (s.w[i] ?? 0)) * dt
    s.w[i] = w
    s.a[i] = a + w * dt
  }
  for (let pass = 0; pass < PASSES; pass++)
    for (let i = 0; i < n - 1; i++) {
      const overlap = DIAMETER - (cradleX(s, i + 1) - cradleX(s, i))
      if (overlap <= 0) continue
      const left = grab?.i === i
      const right = grab?.i === i + 1
      /* split the push between both, unless one is held */
      const shareL = right ? 1 : left ? 0 : 0.5
      const shareR = 1 - shareL
      s.a[i] = angleFor(i, cradleX(s, i) - overlap * shareL)
      s.a[i + 1] = angleFor(i + 1, cradleX(s, i + 1) + overlap * shareR)
      const wl = s.w[i] ?? 0
      const wr = s.w[i + 1] ?? 0
      if (wl <= wr) continue
      if (left) s.w[i + 1] = Math.max(wr, 0)
      else if (right) s.w[i] = Math.min(wl, 0)
      else {
        s.w[i] = wr * RESTITUTION
        s.w[i + 1] = wl * RESTITUTION
      }
    }
}
