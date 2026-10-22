import type { Page } from '@domain/shared'
import { describe, expect, it, vi } from 'vitest'
import { countByResourceStatus } from './count-by-resource-status'

const page = (total: number): Page<unknown> => ({ items: [], total, page: 1, limit: 1 })

describe('countByResourceStatus', () => {
  it('reads live and taken-down totals from one row of each', async () => {
    const list = vi.fn(({ filter }: { filter: { status: string } }) =>
      Promise.resolve(page(filter.status === 'active' ? 18402 : 27)),
    )

    expect(await countByResourceStatus(list)).toEqual({ live: 18402, takenDown: 27 })
    expect(list).toHaveBeenCalledWith({ page: 1, limit: 1, filter: { status: 'active' } })
    expect(list).toHaveBeenCalledWith({ page: 1, limit: 1, filter: { status: 'deactivated' } })
  })

  it('fails when either count fails', async () => {
    const list = vi.fn(({ filter }: { filter: { status: string } }) =>
      filter.status === 'deactivated'
        ? Promise.reject(new Error('down'))
        : Promise.resolve(page(1)),
    )

    await expect(countByResourceStatus(list)).rejects.toThrow('down')
  })
})
