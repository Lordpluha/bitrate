import { describe, expect, it } from 'vitest'
import type { PromotionPlan, PromotionStep } from './promotion.schema'
import {
  formatUsd,
  offsetLabel,
  planCounts,
  stepsByPhase,
} from './promotionLabels'

const step = (
  id: string,
  phase: PromotionStep['phase'],
  state: PromotionStep['state'],
): PromotionStep => ({
  id,
  position: 0,
  offsetDays: 0,
  dueAt: null,
  phase,
  kind: 'POST',
  channels: [],
  title: id,
  body: '',
  state,
  aiGenerated: true,
  regenerating: false,
  regenerationFailure: null,
})

const plan = (steps: PromotionStep[]): PromotionPlan => ({
  id: '00000000-0000-7000-8000-000000000001',
  version: 1,
  status: 'READY',
  failure: null,
  createdAt: '2026-11-01T00:00:00Z',
  releaseDate: null,
  steps,
})

describe('promotion labels', () => {
  it('reads offsets the way the plan does', () => {
    expect([-21, 0, 3].map(offsetLabel)).toEqual(['T−21', 'T0', 'T+3'])
  })

  it('formats micro-dollars as dollars', () => {
    expect(formatUsd(420_000, 'en')).toBe('$0.42')
  })

  it('groups steps by phase and leaves empty phases out', () => {
    const groups = stepsByPhase(
      plan([step('a', 'POST', 'SUGGESTED'), step('b', 'PRE', 'APPROVED')]),
    )
    expect(groups.map((g) => [g.phase, g.steps.map((s) => s.id)])).toEqual([
      ['PRE', ['b']],
      ['POST', ['a']],
    ])
  })

  it('counts edited and finished steps as approved', () => {
    const counts = planCounts(
      plan([
        step('a', 'PRE', 'EDITED'),
        step('b', 'PRE', 'DONE'),
        step('c', 'PRE', 'REJECTED'),
        step('d', 'PRE', 'SUGGESTED'),
      ]),
    )
    expect(counts).toEqual({ total: 4, approved: 2, rejected: 1, suggested: 1 })
  })
})
