import { describe, expect, it, vi } from 'vitest'
import { fetchAllPages, type PaginatedPage } from './fetchAllPages'

const pages: ReadonlyArray<PaginatedPage<string>> = [
  { data: ['a', 'b'], limit: 2, total: 5 },
  { data: ['c', 'd'], limit: 2, total: 5 },
  { data: ['e'], limit: 2, total: 5 },
]

describe('fetchAllPages', () => {
  it('loads every page and keeps the items in page order', async () => {
    const fetchPage = vi.fn(async (page: number) => {
      const result = pages[page - 1]
      if (!result) throw new Error(`No page ${page}`)
      return result
    })

    await expect(fetchAllPages({ fetchPage })).resolves.toEqual([
      'a',
      'b',
      'c',
      'd',
      'e',
    ])
    expect(fetchPage.mock.calls.map(([page]) => page)).toEqual([1, 2, 3])
  })

  it('stops after the first page when it holds everything', async () => {
    const fetchPage = vi.fn(async () => ({ data: [], limit: 100, total: 0 }))

    await expect(fetchAllPages({ fetchPage })).resolves.toEqual([])
    expect(fetchPage).toHaveBeenCalledTimes(1)
  })
})
