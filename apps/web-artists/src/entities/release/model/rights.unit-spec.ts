import { describe, expect, it } from 'vitest'
import {
  basisPointsToPercent,
  describeBlocker,
  isValidUpc,
  normalizeIsrc,
  percentToBasisPoints,
} from './rights'

describe('release rights model', () => {
  it.each([
    ['100', 10_000],
    ['12.5', 1_250],
    ['0.01', 1],
    [' 33.33 ', 3_333],
  ])('converts %p percent to %p basis points', (percent, points) => {
    expect(percentToBasisPoints(percent)).toBe(points)
  })

  it.each(['', '0', '-5', '100.01', '12.345', 'abc', '1e2'])(
    'rejects %p as a share',
    (percent) => {
      expect(percentToBasisPoints(percent)).toBeNull()
    },
  )

  it.each([
    [10_000, '100'],
    [1_250, '12.5'],
    [1, '0.01'],
  ])('shows %p basis points as %p percent', (points, percent) => {
    expect(basisPointsToPercent(points)).toBe(percent)
  })

  it('validates barcodes by their check digit', () => {
    expect(isValidUpc('036000291452')).toBe(true)
    expect(isValidUpc('4006381333931')).toBe(true)
    expect(isValidUpc('036000291453')).toBe(false)
  })

  it('normalizes ISRCs and rejects malformed ones', () => {
    expect(normalizeIsrc('us-rc1-76-07839')).toBe('USRC17607839')
    expect(normalizeIsrc('US-RC1-76-0783')).toBeNull()
  })

  it('names the contributor or recording behind a blocker', () => {
    const names = { contributors: { c1: 'Jordan Lee' } }
    expect(
      describeBlocker(
        { code: 'CONTRIBUTOR_ROLES_MISSING', contributorId: 'c1' },
        names,
      ),
    ).toBe('Jordan Lee needs a role')
    expect(
      describeBlocker(
        {
          code: 'SPLITS_INCOMPLETE',
          rightType: 'COMPOSITION',
          totalBasisPoints: 6_000,
        },
        names,
      ),
    ).toBe('Publishing splits total 60% of 100%')
    expect(describeBlocker({ code: 'NO_TRACKS' }, names)).toBe(
      'Add at least one track',
    )
  })
})
