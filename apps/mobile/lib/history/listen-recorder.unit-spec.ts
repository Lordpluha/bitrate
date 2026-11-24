import { ApiRequestError } from '@/lib/api/api-request-error'

import { createListenRecorder } from './listen-recorder'

const flush = () => new Promise((resolve) => setImmediate(resolve))

describe('createListenRecorder', () => {
  let now = 0
  const clock = () => now

  beforeEach(() => {
    now = 0
  })

  it('records nothing before the listen threshold', async () => {
    const record = jest.fn().mockResolvedValue(undefined)
    const recorder = createListenRecorder({ record, now: clock })
    recorder.onProgress({ trackId: 't1', positionSec: 14 })
    await flush()
    expect(record).not.toHaveBeenCalled()
  })

  it('records a track once after 15 seconds, however often progress ticks', async () => {
    const record = jest.fn().mockResolvedValue(undefined)
    const recorder = createListenRecorder({ record, now: clock })
    recorder.onProgress({ trackId: 't1', positionSec: 15 })
    recorder.onProgress({ trackId: 't1', positionSec: 16 })
    await flush()
    recorder.onProgress({ trackId: 't1', positionSec: 30 })
    await flush()
    expect(record).toHaveBeenCalledTimes(1)
    expect(record).toHaveBeenCalledWith('t1')
  })

  it('retries a transient failure only after the pause', async () => {
    const record = jest.fn().mockRejectedValueOnce(new TypeError('offline')).mockResolvedValue(undefined)
    const recorder = createListenRecorder({ record, now: clock })
    recorder.onProgress({ trackId: 't1', positionSec: 20 })
    await flush()
    recorder.onProgress({ trackId: 't1', positionSec: 21 })
    await flush()
    expect(record).toHaveBeenCalledTimes(1)

    now = 30_000
    recorder.onProgress({ trackId: 't1', positionSec: 50 })
    await flush()
    expect(record).toHaveBeenCalledTimes(2)
  })

  it('gives up on a permanent client error', async () => {
    const record = jest.fn().mockRejectedValue(new ApiRequestError('gone', 404))
    const recorder = createListenRecorder({ record, now: clock })
    recorder.onProgress({ trackId: 't1', positionSec: 20 })
    await flush()
    now = 60_000
    recorder.onProgress({ trackId: 't1', positionSec: 40 })
    await flush()
    expect(record).toHaveBeenCalledTimes(1)
  })
})
