import { describe, expect, it } from 'vitest'
import { type CradleState, cradleX, stepCradle } from './cradlePhysics'

const run = (
  s: CradleState,
  seconds: number,
  grab?: { i: number; a: number },
) => {
  for (let t = 0; t < seconds; t += 1 / 240)
    stepCradle({ s, dt: 1 / 240, grab })
  return s
}

describe('stepCradle', () => {
  it('passes a released end ball’s swing through the row to the far end', () => {
    const s = run({ a: [-0.6, 0, 0, 0, 0], w: [0, 0, 0, 0, 0] }, 0.75)
    expect(s.a[4]).toBeGreaterThan(0.2)
    expect(Math.abs(s.a[0] ?? 1)).toBeLessThan(0.08)
    for (const i of [1, 2, 3]) expect(Math.abs(s.a[i] ?? 1)).toBeLessThan(0.08)
  })

  it('holds a grabbed ball where the pointer put it', () => {
    const s = run({ a: [0, 0, 0, 0, 0], w: [0, 0, 0, 0, 0] }, 0.5, {
      i: 0,
      a: -0.7,
    })
    expect(s.a[0]).toBe(-0.7)
    expect(s.w[0]).toBe(0)
  })

  it('never lets two balls pass through each other', () => {
    const s = run({ a: [0, 0, 0, 0, 0], w: [0, 0, 0, 0, 0] }, 0.5, {
      i: 0,
      a: 0.9,
    })
    for (let i = 0; i < 4; i++)
      expect(cradleX(s, i + 1) - cradleX(s, i)).toBeGreaterThanOrEqual(1.99)
  })
})
