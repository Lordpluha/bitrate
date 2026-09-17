import { describe, expect, it } from '@jest/globals'
import { buildSortOrderBy, type SortOrder, sortQuerySchema } from './sort'

describe('sortQuerySchema', () => {
  const schema = sortQuerySchema(['username', 'createdAt'])

  it('accepts an allowed sort field and order', () => {
    expect(schema.parse({ sort: 'username', order: 'desc' })).toEqual({
      sort: 'username',
      order: 'desc',
    })
  })

  it('leaves both out when the caller omits them', () => {
    expect(schema.parse({})).toEqual({})
  })

  it('rejects a field outside the allowlist', () => {
    expect(() => schema.parse({ sort: 'password' })).toThrow()
  })

  it('rejects an invalid order', () => {
    expect(() => schema.parse({ sort: 'username', order: 'sideways' })).toThrow()
  })
})

describe('buildSortOrderBy', () => {
  const fallback: Record<string, SortOrder>[] = [{ createdAt: 'desc' }, { id: 'desc' }]

  it('returns the fallback unchanged when sort is absent', () => {
    expect(buildSortOrderBy({}, fallback)).toBe(fallback)
  })

  it('orders by the chosen field with a matching-direction id tie-break', () => {
    expect(buildSortOrderBy({ sort: 'username', order: 'desc' }, fallback)).toEqual([
      { username: 'desc' },
      { id: 'desc' },
    ])
  })

  it('defaults order to asc when only sort is given', () => {
    expect(buildSortOrderBy({ sort: 'username' }, fallback)).toEqual([
      { username: 'asc' },
      { id: 'asc' },
    ])
  })
})
