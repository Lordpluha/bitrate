import { describe, expect, it } from 'vitest'
import { planMorph } from './morphPlan'

describe('planMorph', () => {
  it('runs an unfinished morph backwards when the visitor heads back to where it came from', () => {
    expect(planMorph({ a: 0, b: 2, mix: 0.76 }, 0)).toBe('reverse')
  })

  it('keeps going when the target is the shape it is already morphing to', () => {
    expect(planMorph({ a: 0, b: 2, mix: 0.4 }, 2)).toBe('continue')
    expect(planMorph({ a: 2, b: 2, mix: 1 }, 2)).toBe('continue')
  })

  it('finishes an unfinished morph before starting towards a third shape, instead of snapping', () => {
    expect(planMorph({ a: 0, b: 2, mix: 0.76 }, 4)).toBe('chain')
  })

  it('starts a fresh morph from a settled shape', () => {
    expect(planMorph({ a: 0, b: 2, mix: 1 }, 4)).toBe('start')
  })
})
