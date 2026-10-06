import type { INestApplicationContext } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { Logger as PinoLogger } from 'nestjs-pino'

/**
 * Builds the transcode worker as a standalone Nest application context: no Express, Swagger,
 * helmet, CORS or versioning, and no HTTP listener.
 *
 * `AUDIO_PROCESSING_WORKER_ENABLED` is forced on, and only then is the module graph loaded with a
 * dynamic `import()`. `@Processor`'s `autorun` option is read from `process.env` when the consumer
 * class is defined, so a static import of the worker module would evaluate it before this
 * function could set the flag.
 *
 * `enableShutdownHooks()` makes SIGTERM close the context, which lets BullMQ finish its active
 * jobs. The full drain sequence is tracked separately in #179.
 */
export async function bootstrapWorker(): Promise<INestApplicationContext> {
  process.env.AUDIO_PROCESSING_WORKER_ENABLED = 'true'

  const { WorkerModule } = await import('./worker.module')
  const context = await NestFactory.createApplicationContext(WorkerModule, { bufferLogs: true })
  context.useLogger(context.get(PinoLogger))
  context.enableShutdownHooks()
  return context
}
