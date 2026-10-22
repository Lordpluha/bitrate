import { describe, expect, it } from 'vitest'
import { collideBalls, type PhysicsBall } from './physics'

const ball = (x: number, vx: number): PhysicsBall => ({
  r: 10,
  p: { x, y: 0, z: 0 },
  v: { x: vx, y: 0, z: 0 },
})

describe('collideBalls', () => {
  it('pushes overlapping balls apart and bounces them when they approach', () => {
    const a = ball(0, 5)
    const b = ball(15, -5)
    collideBalls({ balls: [a, b], dims: 2, bounce: 1.5 })
    expect(b.p.x - a.p.x).toBeCloseTo(20)
    expect(a.v.x).toBeLessThan(0)
    expect(b.v.x).toBeGreaterThan(0)
  })

  it('leaves balls that do not touch alone', () => {
    const a = ball(0, 5)
    const b = ball(25, -5)
    collideBalls({ balls: [a, b], dims: 3, bounce: 1.5 })
    expect([a.p.x, a.v.x, b.p.x, b.v.x]).toEqual([0, 5, 25, -5])
  })

  it('moves only the free ball when the other one weighs infinitely much', () => {
    const held = ball(0, 0)
    const free = ball(15, -5)
    collideBalls({
      balls: [held, free],
      dims: 2,
      bounce: 1.3,
      inverseMass: (o) => (o === held ? 0 : 1 / o.r),
    })
    expect(held.p.x).toBe(0)
    expect(held.v.x).toBe(0)
    expect(free.p.x).toBeCloseTo(20)
    expect(free.v.x).toBeGreaterThan(0)
  })
})
