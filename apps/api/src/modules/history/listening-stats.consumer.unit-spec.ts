import { describe, expect, it, jest } from '@jest/globals'
import type { Job, Queue } from 'bullmq'
import {
  LISTENING_STATS_EVERY_MS,
  LISTENING_STATS_JOB,
  LISTENING_STATS_SCHEDULER_ID,
  ListeningStatsConsumer,
} from './listening-stats.consumer'
import type { ListeningStatsService } from './listening-stats.service'

const makeStats = () =>
  ({ recompute: jest.fn(async () => undefined) }) as unknown as jest.Mocked<ListeningStatsService>
const makeQueue = () =>
  ({ upsertJobScheduler: jest.fn(async () => ({})) }) as unknown as jest.Mocked<Queue>

describe('ListeningStatsConsumer', () => {
  it('schedules one repeating recompute when the module starts', async () => {
    const queue = makeQueue()
    const consumer = new ListeningStatsConsumer(makeStats(), queue)

    await consumer.onModuleInit()

    expect(queue.upsertJobScheduler).toHaveBeenCalledWith(
      LISTENING_STATS_SCHEDULER_ID,
      { every: LISTENING_STATS_EVERY_MS },
      expect.objectContaining({ name: LISTENING_STATS_JOB }),
    )
  })

  it('recomputes the stats for a recompute job', async () => {
    const stats = makeStats()
    const consumer = new ListeningStatsConsumer(stats, makeQueue())

    await consumer.process({ name: LISTENING_STATS_JOB, data: {} } as Job)

    expect(stats.recompute).toHaveBeenCalledTimes(1)
  })

  it('ignores jobs it does not know', async () => {
    const stats = makeStats()
    const consumer = new ListeningStatsConsumer(stats, makeQueue())

    await consumer.process({ name: 'something-else', data: {} } as Job)

    expect(stats.recompute).not.toHaveBeenCalled()
  })
})
