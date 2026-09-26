import { describe, expect, it } from '@jest/globals'
import { normalizePermissions } from './normalize-permissions'
import { PERMISSIONS } from './permissions'

describe('normalizePermissions', () => {
  it('orders a set by the catalogue', () => {
    const [first, second, third] = PERMISSIONS

    expect(normalizePermissions([third, first, second])).toEqual([first, second, third])
  })

  it('drops repeated entries', () => {
    const [first, second] = PERMISSIONS

    expect(normalizePermissions([second, first, second, first])).toEqual([first, second])
  })

  it('makes the same grant in a different order produce an identical array', () => {
    const [first, second, third] = PERMISSIONS

    expect(normalizePermissions([third, first, second])).toEqual(
      normalizePermissions([second, third, first]),
    )
  })

  it('returns an empty array for an empty set', () => {
    expect(normalizePermissions([])).toEqual([])
  })
})
