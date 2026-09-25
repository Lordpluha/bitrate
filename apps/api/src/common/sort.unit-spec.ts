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

  it.each([
    'username',
    'email',
    'createdAt',
    'title',
    'processingStatus',
    'monthlyListeners',
    'status',
  ])('orders by %s with a matching-direction id tie-break', (sort) => {
    expect(buildSortOrderBy({ sort, order: 'desc' }, fallback)).toEqual([
      { [sort]: 'desc' },
      { id: 'desc' },
    ])
  })

  it.each([
    '__proto__',
    'constructor',
    'prototype',
    'password',
  ])('rejects unsafe or unsupported field %s', (sort) => {
    expect(() => buildSortOrderBy({ sort }, fallback)).toThrow('Unsupported sort field')
  })

  it('defaults order to asc when only sort is given', () => {
    expect(buildSortOrderBy({ sort: 'username' }, fallback)).toEqual([
      { username: 'asc' },
      { id: 'asc' },
    ])
  })
})
