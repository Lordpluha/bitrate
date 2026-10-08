import { describe, expect, it } from 'vitest'
import { parseShares, rightsFormSchema } from './rights.schema'

describe('rights form', () => {
  it('requires a name only when another party owns the master', () => {
    const base = { writersConfirmed: true, accuracyConfirmed: false }
    expect(
      rightsFormSchema.safeParse({
        ...base,
        ownerType: 'ARTIST',
        ownerName: '',
      }).success,
    ).toBe(true)
    expect(
      rightsFormSchema.safeParse({
        ...base,
        ownerType: 'OTHER',
        ownerName: ' ',
      }).success,
    ).toBe(false)
  })

  it('turns filled percentages into basis points and skips empty rows', () => {
    expect(parseShares({ a: '60', b: '', c: '12.5' })).toEqual([
      { contributorId: 'a', shareBasisPoints: 6_000 },
      { contributorId: 'c', shareBasisPoints: 1_250 },
    ])
  })

  it('rejects the whole list when any share is invalid', () => {
    expect(parseShares({ a: '60', b: '0' })).toBeNull()
  })
})
