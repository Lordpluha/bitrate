import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { Job, Queue } from 'bullmq'
import {
  STUCK_TRACKS_JOB,
  STUCK_TRACKS_SCHEDULER_ID,
  STUCK_TRACKS_SWEEP_EVERY_MS,
  StuckTracksConsumer,
} from './stuck-tracks.consumer'
import type { StuckTrackSweeper } from './stuck-tracks.sweeper'

describe('StuckTracksConsumer', () => {
  const originalFlag = process.env.AUDIO_PROCESSING_WORKER_ENABLED
  let queue: jest.Mocked<Pick<Queue, 'upsertJobScheduler'>>
  let sweeper: jest.Mocked<Pick<StuckTrackSweeper, 'sweep'>>
  let consumer: StuckTracksConsumer

  beforeEach(() => {
    queue = { upsertJobScheduler: jest.fn().mockResolvedValue(undefined as never) } as never
    sweeper = { sweep: jest.fn().mockResolvedValue(0 as never) } as never
    consumer = new StuckTracksConsumer(sweeper as never, queue as never)
  })

  afterEach(() => {
    process.env.AUDIO_PROCESSING_WORKER_ENABLED = originalFlag
  })

  it('schedules the sweep in a process that converts audio', async () => {
    process.env.AUDIO_PROCESSING_WORKER_ENABLED = 'true'

    await consumer.onModuleInit()

    expect(queue.upsertJobScheduler).toHaveBeenCalledWith(
      STUCK_TRACKS_SCHEDULER_ID,
      { every: STUCK_TRACKS_SWEEP_EVERY_MS },
      expect.objectContaining({ name: STUCK_TRACKS_JOB }),
    )
  })

  it('leaves scheduling to the worker when this process does not convert audio', async () => {
    process.env.AUDIO_PROCESSING_WORKER_ENABLED = 'false'

    await consumer.onModuleInit()

    expect(queue.upsertJobScheduler).not.toHaveBeenCalled()
  })

  it('runs the sweep for its own job and ignores any other', async () => {
    await consumer.process({ name: STUCK_TRACKS_JOB } as Job)
    await consumer.process({ name: 'something-else' } as Job)

    expect(sweeper.sweep).toHaveBeenCalledTimes(1)
  })
})
