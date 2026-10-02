import type { INestApplicationContext } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { Logger as PinoLogger } from 'nestjs-pino'

/**
 * Rejects an environment the standalone worker cannot run in.
 *
 * The worker is a separate container with no filesystem shared with the API. The local storage
 * driver would silently bring that assumption back, so a production worker must use an object
 * store. An unset `STORAGE_DRIVER` counts as `local`, because that is the schema default. Read
 * from the raw environment: this runs before `ConfigModule` exists. See ADR-0049.
 */
export function assertWorkerStorageSupported(env: NodeJS.ProcessEnv = process.env): void {
  if (env.NODE_ENV === 'production' && (env.STORAGE_DRIVER ?? 'local') === 'local') {
    throw new Error(
      'The transcode worker refuses to start with NODE_ENV=production and STORAGE_DRIVER=local: ' +
        'a separate worker container has no shared filesystem with the API. Set STORAGE_DRIVER=s3.',
    )
  }
}

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
  assertWorkerStorageSupported()
  process.env.AUDIO_PROCESSING_WORKER_ENABLED = 'true'

  const { WorkerModule } = await import('./worker.module')
  const context = await NestFactory.createApplicationContext(WorkerModule, { bufferLogs: true })
  context.useLogger(context.get(PinoLogger))
  context.enableShutdownHooks()
  return context
}
