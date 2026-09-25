import { describe, expect, it } from 'vitest'
import { countPages, DEFAULT_PAGE_SIZE, emptyPage } from './page'

describe('countPages', () => {
  it('rounds a partial last page up', () => {
    expect(countPages({ total: 45, limit: 20 })).toBe(3)
  })

  it('reports one page for an empty list rather than zero', () => {
    expect(countPages({ total: 0, limit: 20 })).toBe(1)
  })

  it('survives a limit of zero instead of dividing by it', () => {
    expect(countPages({ total: 10, limit: 0 })).toBe(1)
  })
})

describe('emptyPage', () => {
  it('starts on page one with the default size', () => {
    expect(emptyPage()).toEqual({ items: [], total: 0, page: 1, limit: DEFAULT_PAGE_SIZE })
  })
})
