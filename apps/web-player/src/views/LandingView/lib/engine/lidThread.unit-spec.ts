import { describe, expect, it } from 'vitest'
import { LID, turnLid } from './lidThread'

const span = 600

describe('turnLid', () => {
  it('loosens the lid when it is dragged right and tightens it when dragged left', () => {
    expect(turnLid({ turns: 0.5, dx: 60, span })).toBeCloseTo(0.6)
    expect(turnLid({ turns: 0.5, dx: -60, span })).toBeCloseTo(0.4)
  })

  it('cannot be tightened past closed', () => {
    expect(turnLid({ turns: 0.05, dx: -300, span })).toBe(0)
  })

  it('is stiff while the seal is still unbroken', () => {
    const fromSealed = turnLid({ turns: 0, dx: 30, span })
    const loose = turnLid({ turns: 0.5, dx: 30, span }) - 0.5
    expect(fromSealed).toBeGreaterThan(0)
    expect(fromSealed).toBeLessThan(loose)
  })

  it('stops at the end of the thread, where the lid comes off', () => {
    expect(turnLid({ turns: 0.9, dx: 600, span })).toBe(LID.offTurns)
  })

  it('takes several strokes to come off, like a real lid', () => {
    let turns = 0
    let strokes = 0
    while (turns < LID.offTurns && strokes < 20) {
      turns = turnLid({ turns, dx: 300, span })
      strokes++
    }
    expect(strokes).toBeGreaterThanOrEqual(3)
    expect(turns).toBe(LID.offTurns)
  })
})
