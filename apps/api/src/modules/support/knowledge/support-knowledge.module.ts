import { SUPPORT_KNOWLEDGE_QUEUE } from '@infra/queues/support-knowledge.queue'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { KnowledgeIngestConsumer } from './knowledge-ingest.consumer'
import { KnowledgeIngestScheduler } from './knowledge-ingest.scheduler'
import { KnowledgeIngestService } from './knowledge-ingest.service'
import { knowledgeIngestDepsProvider } from './knowledge-ingest-deps.provider'

/**
 * The support assistant's knowledge index (ADR-0075): rebuilt from the bundled help articles
 * when the API starts. Imported by the public API process only, so one process consumes.
 */
@Module({
  imports: [BullModule.registerQueue({ name: SUPPORT_KNOWLEDGE_QUEUE })],
  providers: [
    knowledgeIngestDepsProvider,
    KnowledgeIngestService,
    KnowledgeIngestConsumer,
    KnowledgeIngestScheduler,
  ],
  exports: [KnowledgeIngestService],
})
export class SupportKnowledgeModule {}
