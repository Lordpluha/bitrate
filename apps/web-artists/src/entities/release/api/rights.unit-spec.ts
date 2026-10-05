import { clientFetchClient } from '@shared/api/fetchClient'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { saveSplits } from './rights'

const id = '019a0000-0000-7000-8000-000000000200'
const contributorId = '10af9f3e-2c5c-486b-9374-c67f8b556683'
const expectedUpdatedAt = '2026-10-05T14:50:30.438Z'
const release = {
  id,
  title: 'Steel Ball Run',
  type: 'SINGLE',
  status: 'DRAFT',
  upc: null,
  scheduledAt: null,
  createdAt: '2026-10-05T14:50:30.366Z',
  updatedAt: '2026-10-05T14:50:31.000Z',
}
const input = {
  rightType: 'RECORDING' as const,
  shares: [{ contributorId, shareBasisPoints: 10_000 }],
  expectedUpdatedAt,
}

function respond(status: number, body: unknown) {
  vi.spyOn(clientFetchClient, 'PUT').mockResolvedValue({
    data: status < 400 ? body : undefined,
    error: status < 400 ? undefined : body,
    response: new Response(null, { status }),
  } as never)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('saveSplits', () => {
  it('confirms a newer release version with the saved shares', async () => {
    respond(200, { release, rightType: 'RECORDING', shares: input.shares })
    await expect(saveSplits({ id, input })).resolves.toMatchObject({
      rightType: 'RECORDING',
      shares: input.shares,
    })
  })

  it('does not confirm a write whose version did not advance', async () => {
    respond(200, {
      release: { ...release, updatedAt: expectedUpdatedAt },
      rightType: 'RECORDING',
      shares: input.shares,
    })
    await expect(saveSplits({ id, input })).rejects.toThrow(
      'Could not confirm the splits were saved',
    )
  })

  it('explains a stale draft', async () => {
    respond(409, { message: 'Release changed' })
    await expect(saveSplits({ id, input })).rejects.toThrow(
      'This release changed or is no longer a draft',
    )
  })
})
