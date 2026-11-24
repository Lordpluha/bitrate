import {
  SUPPORT_KNOWLEDGE_JOB_OPTIONS,
  SUPPORT_KNOWLEDGE_JOBS,
  SUPPORT_KNOWLEDGE_QUEUE,
} from '@infra/queues/support-knowledge.queue'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common'
import type { Queue } from 'bullmq'

/**
 * Enqueues one ingest when the API starts, so a deploy that changes the bundled help articles
 * also updates the index. An unchanged deploy costs one alias lookup.
 */
@Injectable()
export class KnowledgeIngestScheduler implements OnApplicationBootstrap {
  private readonly logger = new Logger(KnowledgeIngestScheduler.name)

  constructor(@InjectQueue(SUPPORT_KNOWLEDGE_QUEUE) private readonly queue: Queue) {}

  async onApplicationBootstrap() {
    try {
      await this.queue.add(SUPPORT_KNOWLEDGE_JOBS.INGEST, {}, SUPPORT_KNOWLEDGE_JOB_OPTIONS)
    } catch (error: unknown) {
      // The assistant is not on the critical path: a Redis hiccup must not stop the API.
      this.logger.warn(`Could not enqueue the support knowledge ingest: ${String(error)}`)
    }
  }
}
