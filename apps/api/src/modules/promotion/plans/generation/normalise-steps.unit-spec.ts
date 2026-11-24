import { describe, expect, it } from '@jest/globals'
import { normaliseSteps } from './normalise-steps'
import { type PlanOutput, PlanOutputSchema } from './plan-output.schema'

type Step = PlanOutput['steps'][number]
const step = (over: Partial<Step>): Step => ({
  offsetDays: -7,
  kind: 'POST',
  channels: ['INSTAGRAM'],
  title: 'Share a hook',
  body: 'A 15-second hook.',
  ...over,
})

describe('PlanOutputSchema', () => {
  it('rejects a step outside the four-week window', () => {
    const output = { steps: [step({}), step({}), step({ offsetDays: 40 })] }
    expect(PlanOutputSchema.safeParse(output).success).toBe(false)
  })
})

describe('normaliseSteps', () => {
  it('orders by date, numbers positions and derives phases', () => {
    const steps = [
      step({ offsetDays: 3 }),
      step({ offsetDays: -7 }),
      step({ kind: 'ACTION', offsetDays: 0, channels: [] }),
    ]
    const rows = normaliseSteps({ steps }, ['INSTAGRAM'], 5)
    expect(rows.map((r) => [r.position, r.offsetDays, r.phase])).toEqual([
      [5, -7, 'PRE'],
      [6, 0, 'LAUNCH'],
      [7, 3, 'POST'],
    ])
  })

  it('keeps only the channels the artist uses and drops posts left without one', () => {
    const steps = [
      step({ channels: ['INSTAGRAM', 'TIKTOK'] }),
      step({ channels: ['TIKTOK'], title: 'TikTok only' }),
    ]
    const rows = normaliseSteps({ steps }, ['INSTAGRAM'], 0)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.channels).toEqual(['INSTAGRAM'])
  })

  it('keeps one follower message, on release day, and countdowns only before it', () => {
    const steps = [
      step({ kind: 'FOLLOWER_MESSAGE', offsetDays: 2, channels: [] }),
      step({ kind: 'FOLLOWER_MESSAGE', offsetDays: 0, channels: [] }),
      step({ kind: 'COUNTDOWN', offsetDays: 1, channels: [] }),
      step({ kind: 'COUNTDOWN', offsetDays: -14, channels: [] }),
    ]
    const rows = normaliseSteps({ steps }, ['INSTAGRAM'], 0)
    expect(rows.map((r) => [r.kind, r.offsetDays])).toEqual([
      ['COUNTDOWN', -14],
      ['FOLLOWER_MESSAGE', 0],
    ])
  })
})
