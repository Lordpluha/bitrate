import { EventEmitter } from 'node:events'
import { describe, expect, it } from '@jest/globals'
import { type QueueCountsSource, WorkerMetrics } from './worker-metrics'

function fakeQueue(name: string, counts: Record<string, number> | Error): QueueCountsSource {
  return {
    name,
    getJobCounts: () =>
      counts instanceof Error ? Promise.reject(counts) : Promise.resolve(counts),
  }
}

describe('WorkerMetrics', () => {
  it('exposes the queue states computed at scrape time, per queue', async () => {
    const queues = [
      fakeQueue('audio-processing', { waiting: 3, active: 2, failed: 1, delayed: 4 }),
      fakeQueue('audio-processing-dead-letter', { waiting: 7, active: 0, failed: 0, delayed: 0 }),
    ]
    const metrics = new WorkerMetrics(queues)

    const rendered = await metrics.render()

    expect(rendered).toContain(
      'bitrate_worker_queue_jobs{queue="audio-processing",state="waiting"} 3',
    )
    expect(rendered).toContain(
      'bitrate_worker_queue_jobs{queue="audio-processing",state="active"} 2',
    )
    expect(rendered).toContain(
      'bitrate_worker_queue_jobs{queue="audio-processing",state="failed"} 1',
    )
    expect(rendered).toContain(
      'bitrate_worker_queue_jobs{queue="audio-processing",state="delayed"} 4',
    )
    expect(rendered).toContain(
      'bitrate_worker_queue_jobs{queue="audio-processing-dead-letter",state="waiting"} 7',
    )
  })

  it('reads fresh counts on every scrape', async () => {
    let waiting = 1
    const metrics = new WorkerMetrics([
      { name: 'audio-processing', getJobCounts: async () => ({ waiting }) },
    ])

    await metrics.render()
    waiting = 9

    expect(await metrics.render()).toContain(
      'bitrate_worker_queue_jobs{queue="audio-processing",state="waiting"} 9',
    )
  })

  it('still renders, without stale queue figures, when Redis cannot answer', async () => {
    let failing = false
    const metrics = new WorkerMetrics([
      {
        name: 'audio-processing',
        getJobCounts: () =>
          failing ? Promise.reject(new Error('redis down')) : Promise.resolve({ waiting: 5 }),
      },
    ])
    await metrics.render()
    failing = true

    const rendered = await metrics.render()

    expect(rendered).not.toContain('bitrate_worker_queue_jobs{')
    expect(rendered).toContain('process_cpu_user_seconds_total')
  })

  it('counts completed and failed jobs and observes the processing duration', async () => {
    const worker = new EventEmitter()
    const metrics = new WorkerMetrics([])
    metrics.observeWorker(worker)

    worker.emit('completed', { processedOn: 1_000, finishedOn: 3_500 })
    worker.emit('failed', { processedOn: 10_000, finishedOn: 10_500 }, new Error('boom'))
    worker.emit('failed', undefined, new Error('stalled too often'))

    const rendered = await metrics.render()

    expect(rendered).toContain('bitrate_worker_jobs_total{outcome="completed"} 1')
    expect(rendered).toContain('bitrate_worker_jobs_total{outcome="failed"} 2')
    expect(rendered).toContain('bitrate_worker_job_duration_seconds_count{outcome="completed"} 1')
    expect(rendered).toContain('bitrate_worker_job_duration_seconds_sum{outcome="completed"} 2.5')
    expect(rendered).toContain('bitrate_worker_job_duration_seconds_count{outcome="failed"} 1')
  })

  it('exposes default process metrics on its own registry, not the API prefix', async () => {
    const rendered = await new WorkerMetrics([]).render()

    expect(rendered).toContain('process_cpu_user_seconds_total')
    expect(rendered).not.toContain('bitrate_api_')
  })
})
