import type { Server } from 'node:http'
import type { AppConfig } from '@common/config'
import { PROMETHEUS_CONTENT_TYPE } from '@infra/observability/metrics.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import {
  AUDIO_PROCESSING_DEAD_LETTER_QUEUE,
  AUDIO_PROCESSING_QUEUE,
} from '@infra/queues/audio-processing.queue'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import { AudioProcessingConsumer } from '@modules/tracks/audio-processing.consumer'
import { InjectQueue } from '@nestjs/bullmq'
import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Queue } from 'bullmq'
import { createWorkerHttpServer } from './worker-http.server'
import { WorkerMetrics } from './worker-metrics'

/**
 * Owns the worker's internal health and metrics listener: starts it once every module is
 * initialised (so the BullMQ worker exists) and closes it when the context shuts down, so SIGTERM
 * still drains active jobs. Never published outside the compose network.
 */
@Injectable()
export class WorkerHttpService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(WorkerHttpService.name)
  private server?: Server

  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
    @InjectQueue(AUDIO_PROCESSING_QUEUE) private readonly queue: Queue,
    @InjectQueue(AUDIO_PROCESSING_DEAD_LETTER_QUEUE) private readonly deadLetterQueue: Queue,
    private readonly consumer: AudioProcessingConsumer,
    private readonly config: ConfigService<AppConfig>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const metrics = new WorkerMetrics([this.queue, this.deadLetterQueue])
    metrics.observeWorker(this.consumer.worker)

    const server = createWorkerHttpServer({
      checks: {
        postgres: () => this.prisma.ping(),
        redis: () => this.queue.getJobCounts('waiting'),
        storage: async () => {
          if (!(await this.storage.healthCheck())) throw new Error('storage not healthy')
        },
      },
      timeoutMs: this.config.getOrThrow('HEALTH_CHECK_TIMEOUT_MS'),
      renderMetrics: () => metrics.render(),
      contentType: PROMETHEUS_CONTENT_TYPE,
      metricsToken: this.config.get('METRICS_TOKEN'),
    })
    const port = this.config.getOrThrow('WORKER_HTTP_PORT')
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject)
      server.listen(port, () => {
        server.off('error', reject)
        resolve()
      })
    })
    this.server = server
    this.logger.log(`Worker health and metrics listening on :${port}`)
  }

  async onApplicationShutdown(): Promise<void> {
    const server = this.server
    if (!server) return
    this.server = undefined
    await new Promise<void>((resolve) => {
      server.close(() => resolve())
      server.closeAllConnections()
    })
  }
}
