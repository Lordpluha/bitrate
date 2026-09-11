import { describe, expect, it } from '@jest/globals'
import { ListAdminUsersQuerySchema } from '@modules/admin/users/dtos'
import { MAX_LIMIT, paginationQuerySchema } from './pagination'

/**
 * The bound used to be written out as a literal `100` in each of the five operator list DTOs.
 * These cases assert it through a resource schema rather than through `paginationQuerySchema`
 * alone, because the thing worth pinning is that extending does not lose it.
 */
describe('paginationQuerySchema', () => {
  it('coerces the strings a query string actually delivers', () => {
    expect(paginationQuerySchema.parse({ page: '3', limit: '50' })).toEqual({
      page: 3,
      limit: 50,
    })
  })

  it('leaves both out when the caller omits them', () => {
    expect(paginationQuerySchema.parse({})).toEqual({})
  })

  it.each([
    ['a page below one', { page: '0' }],
    ['a fractional page', { page: '1.5' }],
    ['a limit below one', { limit: '0' }],
    ['a non-numeric page', { page: 'first' }],
  ])('rejects %s', (_name, query) => {
    expect(() => paginationQuerySchema.parse(query)).toThrow()
  })

  it(`rejects a limit above MAX_LIMIT (${MAX_LIMIT})`, () => {
    expect(() => paginationQuerySchema.parse({ limit: String(MAX_LIMIT + 1) })).toThrow()
    expect(paginationQuerySchema.parse({ limit: String(MAX_LIMIT) })).toEqual({
      limit: MAX_LIMIT,
    })
  })

  describe('when a resource extends it', () => {
    it('keeps the shared bound alongside its own filters', () => {
      expect(() => ListAdminUsersQuerySchema.parse({ limit: String(MAX_LIMIT + 1) })).toThrow()
      /** Accepting the bound itself is the half that catches a narrower local override. */
      expect(ListAdminUsersQuerySchema.parse({ limit: String(MAX_LIMIT) })).toEqual({
        limit: MAX_LIMIT,
      })
      expect(ListAdminUsersQuerySchema.parse({ page: '2', limit: '10', q: 'ada' })).toEqual({
        page: 2,
        limit: 10,
        q: 'ada',
      })
    })

    it('still rejects that resource its own way', () => {
      expect(() => ListAdminUsersQuerySchema.parse({ q: '' })).toThrow()
    })
  })
})
