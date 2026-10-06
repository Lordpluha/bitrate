import { describe, expect, it, jest } from '@jest/globals'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { runBatch } from './run-batch'

describe('runBatch', () => {
  it('reports every id as succeeded when all apply calls resolve', async () => {
    const apply = jest.fn<(id: string) => Promise<unknown>>().mockResolvedValue(undefined)

    const result = await runBatch(['a', 'b'], apply)

    expect(result).toEqual({
      results: [
        { id: 'a', status: 'succeeded' },
        { id: 'b', status: 'succeeded' },
      ],
      total: 2,
      succeeded: 2,
      failed: 0,
    })
  })

  it('surfaces each failure per id and keeps going', async () => {
    const apply = jest.fn<(id: string) => Promise<unknown>>((id) => {
      if (id === 'missing') return Promise.reject(new NotFoundException('Track missing not found'))
      if (id === 'gone') {
        return Promise.reject(new ConflictException('Track gone is already deleted'))
      }
      return Promise.resolve()
    })

    const result = await runBatch(['ok', 'missing', 'gone', 'ok2'], apply)

    expect(result.results).toEqual([
      { id: 'ok', status: 'succeeded' },
      {
        id: 'missing',
        status: 'failed',
        error: { code: 'NOT_FOUND', message: 'Track missing not found' },
      },
      {
        id: 'gone',
        status: 'failed',
        error: { code: 'CONFLICT', message: 'Track gone is already deleted' },
      },
      { id: 'ok2', status: 'succeeded' },
    ])
    expect(result).toMatchObject({ total: 4, succeeded: 2, failed: 2 })
  })

  it('does not leak the message of an unexpected error', async () => {
    const result = await runBatch(['a'], () =>
      Promise.reject(new Error('connection string postgres://secret')),
    )

    expect(result.results[0]).toEqual({
      id: 'a',
      status: 'failed',
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected error' },
    })
  })

  it('applies each distinct id once', async () => {
    const apply = jest.fn<(id: string) => Promise<unknown>>().mockResolvedValue(undefined)

    const result = await runBatch(['a', 'a', 'b'], apply)

    expect(apply).toHaveBeenCalledTimes(2)
    expect(result.total).toBe(2)
  })
})
