import { describe, expect, it } from 'vitest'
import { batchResultDto, buildBatchBody, toBatchResult } from './batch-result.dto'

const WIRE = {
  results: [
    { id: 'a', status: 'succeeded' },
    { id: 'b', status: 'failed', error: { code: 'CONFLICT', message: 'already deleted' } },
  ],
  total: 2,
  succeeded: 1,
  failed: 1,
}

describe('batch result wire mapping', () => {
  it('maps the wire result to per-row outcomes with the failure message', () => {
    expect(toBatchResult(batchResultDto.parse(WIRE))).toEqual({
      items: [
        { id: 'a', outcome: 'succeeded' },
        { id: 'b', outcome: 'failed', failure: { code: 'CONFLICT', message: 'already deleted' } },
      ],
      succeeded: 1,
      failed: 1,
    })
  })

  it('rejects a status the contract does not declare', () => {
    expect(() =>
      batchResultDto.parse({ ...WIRE, results: [{ id: 'a', status: 'skipped' }] }),
    ).toThrow()
  })

  it('builds the request body from the ids', () => {
    expect(buildBatchBody(['a', 'b'])).toEqual({ ids: ['a', 'b'] })
  })
})
