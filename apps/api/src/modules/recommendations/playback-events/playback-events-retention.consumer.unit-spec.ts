import { describe, expect, it, jest } from '@jest/globals'
import type { Job, Queue } from 'bullmq'
import type { PlaybackEventsService } from './playback-events.service'
import {
  PLAYBACK_EVENTS_RETENTION_EVERY_MS,
  PLAYBACK_EVENTS_RETENTION_JOB,
  PLAYBACK_EVENTS_RETENTION_SCHEDULER_ID,
  PlaybackEventsRetentionConsumer,
} from './playback-events-retention.consumer'

const makeEvents = () =>
  ({ removeExpired: jest.fn(async () => 0) }) as unknown as jest.Mocked<PlaybackEventsService>
const makeQueue = () =>
  ({ upsertJobScheduler: jest.fn(async () => ({})) }) as unknown as jest.Mocked<Queue>

describe('PlaybackEventsRetentionConsumer', () => {
  it('schedules one daily removal when the module starts', async () => {
    const queue = makeQueue()
    const consumer = new PlaybackEventsRetentionConsumer(makeEvents(), queue)

    await consumer.onModuleInit()

    expect(queue.upsertJobScheduler).toHaveBeenCalledWith(
      PLAYBACK_EVENTS_RETENTION_SCHEDULER_ID,
      { every: PLAYBACK_EVENTS_RETENTION_EVERY_MS },
      expect.objectContaining({ name: PLAYBACK_EVENTS_RETENTION_JOB }),
    )
  })

  it('removes expired events for a removal job', async () => {
    const events = makeEvents()
    const consumer = new PlaybackEventsRetentionConsumer(events, makeQueue())

    await consumer.process({ name: PLAYBACK_EVENTS_RETENTION_JOB, data: {} } as Job)

    expect(events.removeExpired).toHaveBeenCalledTimes(1)
  })

  it('ignores jobs it does not know', async () => {
    const events = makeEvents()
    const consumer = new PlaybackEventsRetentionConsumer(events, makeQueue())

    await consumer.process({ name: 'something-else', data: {} } as Job)

    expect(events.removeExpired).not.toHaveBeenCalled()
  })
})
