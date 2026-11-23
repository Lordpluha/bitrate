import {
  SUPPORT_KNOWLEDGE_JOBS,
  SUPPORT_KNOWLEDGE_QUEUE,
} from '@infra/queues/support-knowledge.queue'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import type { Job } from 'bullmq'
import { KnowledgeIngestService } from './knowledge-ingest.service'

/** Runs knowledge ingests. One at a time: two concurrent rebuilds would race on the alias. */
@Injectable()
@Processor(SUPPORT_KNOWLEDGE_QUEUE, { concurrency: 1 })
export class KnowledgeIngestConsumer extends WorkerHost {
  private readonly logger = new Logger(KnowledgeIngestConsumer.name)

  constructor(private readonly ingest: KnowledgeIngestService) {
    super()
  }

  async process(job: Job) {
    if (job.name !== SUPPORT_KNOWLEDGE_JOBS.INGEST) {
      this.logger.warn(`Ignoring unknown support-knowledge job ${job.name}`)
      return
    }
    const result = await this.ingest.ingest()
    return result
  }
}
