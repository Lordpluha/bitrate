import { describe, expect, it, vi } from 'vitest'
import { createCollection, type Page } from './collection'

type Row = { id: string }

function page(overrides: Partial<Page<Row>> = {}): Page<Row> {
  return { data: [{ id: 'a' }], total: 1, page: 1, limit: 20, ...overrides }
}

describe('createCollection', () => {
  it('starts empty and not loading', () => {
    const collection = createCollection<Row>({ load: async () => page(), errorMessage: 'nope' })

    expect(collection.items()).toEqual([])
    expect(collection.total()).toBe(0)
    expect(collection.loading()).toBe(false)
    expect(collection.failure()).toBeNull()
  })

  it('takes page, total and limit from the response rather than assuming them', async () => {
    const collection = createCollection<Row>({
      load: async () => page({ data: [{ id: 'a' }, { id: 'b' }], total: 45, page: 3, limit: 15 }),
      errorMessage: 'nope',
    })

    await collection.restart()

    expect(collection.items()).toHaveLength(2)
    expect(collection.total()).toBe(45)
    expect(collection.page()).toBe(3)
    expect(collection.pageCount()).toBe(3)
  })

  it('reports at least one page even when there is nothing to show', async () => {
    const collection = createCollection<Row>({
      load: async () => page({ data: [], total: 0 }),
      errorMessage: 'nope',
    })

    await collection.restart()

    expect(collection.pageCount()).toBe(1)
    expect(collection.items()).toEqual([])
  })

  describe('when the load fails', () => {
    it('surfaces the message and clears stale rows rather than leaving them on screen', async () => {
      let shouldFail = false
      const collection = createCollection<Row>({
        load: async () => {
          if (shouldFail) throw new Error('boom')
          return page({ data: [{ id: 'a' }], total: 1 })
        },
        errorMessage: 'Could not load rows.',
      })

      await collection.restart()
      expect(collection.items()).toHaveLength(1)

      shouldFail = true
      await collection.reload()

      expect(collection.failure()).toBe('Could not load rows.')
      expect(collection.items()).toEqual([])
      expect(collection.total()).toBe(0)
      expect(collection.loading()).toBe(false)
    })

    it('clears the previous failure on the next successful load', async () => {
      let shouldFail = true
      const collection = createCollection<Row>({
        load: async () => {
          if (shouldFail) throw new Error('boom')
          return page()
        },
        errorMessage: 'Could not load rows.',
      })

      await collection.restart()
      expect(collection.failure()).not.toBeNull()

      shouldFail = false
      await collection.restart()

      expect(collection.failure()).toBeNull()
    })
  })

  describe('paging', () => {
    it('refuses to go below the first page or past the last', async () => {
      const load = vi.fn(async () => page({ total: 45, page: 1, limit: 15 }))
      const collection = createCollection<Row>({ load, errorMessage: 'nope' })

      await collection.restart()
      expect(load).toHaveBeenCalledTimes(1)

      await collection.goTo(0)
      await collection.goTo(4)

      expect(load).toHaveBeenCalledTimes(1)
    })

    it('ignores a jump to the page already shown', async () => {
      const load = vi.fn(async () => page({ total: 45, page: 2, limit: 15 }))
      const collection = createCollection<Row>({ load, errorMessage: 'nope' })

      await collection.restart()
      await collection.goTo(2)

      expect(load).toHaveBeenCalledTimes(1)
    })

    it('always restarts from page one, whatever page is shown', async () => {
      const load = vi.fn(async (requested: number) =>
        page({ total: 45, page: requested, limit: 15 }),
      )
      const collection = createCollection<Row>({ load, errorMessage: 'nope' })

      await collection.restart()
      await collection.goTo(3)
      expect(collection.page()).toBe(3)

      await collection.restart()

      expect(load).toHaveBeenLastCalledWith(1)
      expect(collection.page()).toBe(1)
    })

    it('reloads the current page, not the first one', async () => {
      const load = vi.fn(async (requested: number) =>
        page({ total: 45, page: requested, limit: 15 }),
      )
      const collection = createCollection<Row>({ load, errorMessage: 'nope' })

      await collection.restart()
      await collection.goTo(2)
      await collection.reload()

      expect(load).toHaveBeenLastCalledWith(2)
    })
  })

  it('lets a caller report a failure that did not come from loading', async () => {
    const collection = createCollection<Row>({ load: async () => page(), errorMessage: 'nope' })
    await collection.restart()

    collection.fail('Could not deactivate that account.')

    expect(collection.failure()).toBe('Could not deactivate that account.')
    expect(collection.items()).toHaveLength(1)
  })
})
