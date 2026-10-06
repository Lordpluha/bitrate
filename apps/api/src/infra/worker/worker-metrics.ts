import { Counter, collectDefaultMetrics, Gauge, Histogram, Registry } from '@prometheus-io/client'

/** The part of a BullMQ `Queue` the scrape needs: its name and live job counts. */
export type QueueCountsSource = {
  name: string
  getJobCounts(...states: string[]): Promise<Record<string, number>>
}

/** Timestamps BullMQ stamps on a job; absent when the job object is gone. */
export type FinishedJob = { processedOn?: number; finishedOn?: number }

/** The part of a BullMQ `Worker` the metrics observe. */
export type JobEventSource = {
  on(event: 'completed', listener: (job: FinishedJob) => void): unknown
  on(event: 'failed', listener: (job: FinishedJob | undefined, error: Error) => void): unknown
}

type JobOutcome = 'completed' | 'failed'

/** The states charted for each queue. */
const QUEUE_STATES = ['waiting', 'active', 'failed', 'delayed'] as const

/** Buckets for an audio transcode, in seconds: a second up to half an hour. */
const JOB_DURATION_BUCKETS_SECONDS = [1, 5, 15, 30, 60, 120, 300, 600, 1_200, 1_800]

/**
 * Prometheus metrics of the transcode worker process, on a registry it owns — separate from the
 * API's `MetricsService`, and prefixed `bitrate_worker_` so a scrape never confuses the two.
 *
 * Queue figures are read from Redis on each scrape, not tracked in memory, so they are correct
 * even right after a restart. `failed` counts every failed attempt, retries included.
 */
export class WorkerMetrics {
  private readonly registry = new Registry()
  private readonly jobsTotal: Counter<'outcome'>
  private readonly jobDurationSeconds: Histogram<'outcome'>

  constructor(queues: readonly QueueCountsSource[]) {
    collectDefaultMetrics({ register: this.registry })

    const queueJobs: Gauge<'queue' | 'state'> = new Gauge({
      name: 'bitrate_worker_queue_jobs',
      help: 'Jobs per queue and state, read from BullMQ at scrape time.',
      labelNames: ['queue', 'state'],
      registers: [this.registry],
      async collect() {
        queueJobs.reset()
        await Promise.all(
          queues.map(async (queue) => {
            try {
              const counts = await queue.getJobCounts(...QUEUE_STATES)
              for (const state of QUEUE_STATES) {
                queueJobs.set({ queue: queue.name, state }, counts[state] ?? 0)
              }
            } catch {
              // Redis unreachable: leave this queue's series absent rather than serve stale ones.
            }
          }),
        )
      },
    })

    this.jobsTotal = new Counter({
      name: 'bitrate_worker_jobs_total',
      help: 'Job attempts finished by this worker, by outcome.',
      labelNames: ['outcome'],
      registers: [this.registry],
    })
    this.jobDurationSeconds = new Histogram({
      name: 'bitrate_worker_job_duration_seconds',
      help: 'Processing time of a job attempt in seconds, by outcome.',
      labelNames: ['outcome'],
      buckets: JOB_DURATION_BUCKETS_SECONDS,
      registers: [this.registry],
    })
  }

  /** Counts every completed and failed attempt the given BullMQ worker finishes. */
  observeWorker(worker: JobEventSource): void {
    worker.on('completed', (job) => this.record('completed', job))
    worker.on('failed', (job) => this.record('failed', job))
  }

  render(): Promise<string> {
    return this.registry.metrics()
  }

  private record(outcome: JobOutcome, job: FinishedJob | undefined): void {
    this.jobsTotal.inc({ outcome })
    if (job?.processedOn === undefined || job.finishedOn === undefined) return
    const durationMs = job.finishedOn - job.processedOn
    if (Number.isFinite(durationMs) && durationMs >= 0) {
      this.jobDurationSeconds.observe({ outcome }, durationMs / 1000)
    }
  }
}
