import { describe, expect, it } from '@jest/globals'
import { dateFacts } from './date-facts'
import { phaseFor } from './phase-for'
import { stepDate } from './step-date'

const RELEASE = new Date('2026-09-26T18:00:00Z')

describe('phaseFor', () => {
  it('derives the phase from the offset', () => {
    expect([phaseFor(-1), phaseFor(0), phaseFor(3)]).toEqual(['PRE', 'LAUNCH', 'POST'])
  })
})

describe('stepDate', () => {
  it('dates a step from the release date, so moving the release moves the step', () => {
    expect(stepDate(RELEASE, -21).toISOString()).toBe('2026-09-05T18:00:00.000Z')
    expect(stepDate(new Date('2026-10-03T18:00:00Z'), -21).toISOString()).toBe(
      '2026-09-12T18:00:00.000Z',
    )
  })
})

describe('dateFacts', () => {
  it('lists every spelling of the date the grounding check should accept', () => {
    expect(dateFacts(RELEASE)).toEqual([
      '2026-09-26',
      'Sep 26, 2026',
      'September 26',
      '26 September 2026',
    ])
  })
})
