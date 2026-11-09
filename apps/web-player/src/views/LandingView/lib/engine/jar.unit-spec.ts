import { describe, expect, it } from 'vitest'
import { containInJar, containLoose, hasLeftJar, jarBox } from './jar'
import type { PhysicsBall } from './physics'

const ball = (x: number, y: number, vx = 0, vy = 0, r = 40): PhysicsBall => ({
  r,
  p: { x, y, z: 0 },
  v: { x: vx, y: vy, z: 0 },
})

describe('jarBox', () => {
  it('stands the full-size jar centred on the floor of the desktop pit', () => {
    const jar = jarBox({ w: 880, h: 780 })
    expect(jar.scale).toBe(1)
    expect(jar.right - jar.left).toBe(520)
    expect((jar.left + jar.right) / 2).toBe(440)
    expect(jar.bottom).toBe(764)
    expect(jar.bottom - jar.top).toBe(600)
  })

  it('shrinks the jar (and so the balls) in a phone-sized pit, but not below a floor', () => {
    expect(jarBox({ w: 358, h: 320 }).scale).toBeCloseTo(0.444, 2)
    expect(jarBox({ w: 100, h: 100 }).scale).toBe(0.42)
  })
})

describe('containInJar', () => {
  const jar = jarBox({ w: 880, h: 780 })

  it('keeps a ball off the walls and the floor', () => {
    const b = ball(jar.left, jar.bottom + 10, -300, 500)
    containInJar({ ball: b, jar, open: false })
    expect(b.p.x).toBe(jar.left + 40)
    expect(b.p.y).toBe(jar.bottom - 40)
    expect(b.v.x).toBeGreaterThan(0)
    expect(b.v.y).toBeLessThan(0)
  })

  it('holds a ball under a closed lid', () => {
    const b = ball(440, jar.top, 0, -800)
    containInJar({ ball: b, jar, open: false })
    expect(b.p.y).toBe(jar.top + 40)
    expect(b.v.y).toBeGreaterThan(0)
  })

  it('lets a ball rise past the rim of an open jar', () => {
    const b = ball(440, jar.top - 1, 0, -800)
    containInJar({ ball: b, jar, open: true })
    expect(b.p.y).toBe(jar.top - 1)
    expect(b.v.y).toBe(-800)
  })
})

describe('containInJar while the jar is shaken', () => {
  const jar = jarBox({ w: 880, h: 780 })

  it('throws the bubbles with the walls and floor that hit them', () => {
    const sideways = ball(jar.left + 30, 500, 0, 0)
    containInJar({ ball: sideways, jar, open: false, wall: { x: 900, y: 0 } })
    expect(sideways.v.x).toBeGreaterThan(900)

    const lifted = ball(440, jar.bottom - 30, 0, 0)
    containInJar({ ball: lifted, jar, open: true, wall: { x: 0, y: -1400 } })
    expect(lifted.v.y).toBeLessThan(-1400)
  })

  it('does not pull a bubble along with a wall moving away from it', () => {
    const b = ball(jar.left + 30, 500, 0, 0)
    containInJar({ ball: b, jar, open: false, wall: { x: -900, y: 0 } })
    expect(b.v.x).toBe(0)
  })
})

describe('hasLeftJar', () => {
  const jar = jarBox({ w: 880, h: 780 })

  it('counts a ball as out only once it is wholly above the rim', () => {
    expect(hasLeftJar({ ball: ball(440, jar.top - 39), jar })).toBe(false)
    expect(hasLeftJar({ ball: ball(440, jar.top - 41), jar })).toBe(true)
  })
})

describe('containLoose', () => {
  it('walls a loose ball in at the screen edges', () => {
    const b = ball(1500, 100, 400, 0)
    containLoose({ ball: b, width: 1440, height: 900, floor: null })
    expect(b.p.x).toBe(1400)
    expect(b.v.x).toBeLessThan(0)
  })

  it('lets it fall through every scene but the footer one, reporting when it is gone', () => {
    expect(
      containLoose({
        ball: ball(200, 900),
        width: 1440,
        height: 900,
        floor: null,
      }),
    ).toBe(false)
    expect(
      containLoose({
        ball: ball(200, 941),
        width: 1440,
        height: 900,
        floor: null,
      }),
    ).toBe(true)
  })

  it('lands it on the footer in the footer scene', () => {
    const b = ball(200, 900, 0, 600)
    expect(
      containLoose({ ball: b, width: 1440, height: 900, floor: 800 }),
    ).toBe(false)
    expect(b.p.y).toBe(760)
    expect(b.v.y).toBeLessThan(0)
  })
})
