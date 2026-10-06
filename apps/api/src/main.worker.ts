/**
 * Sentry first, before anything else is imported — see main.ts for why the order matters.
 * `bootstrapWorker()` forces `AUDIO_PROCESSING_WORKER_ENABLED=true` and loads the module graph
 * afterwards, so nothing imported here may pull in the audio-processing consumer.
 */
import './instrument'

import { Logger } from '@nestjs/common'
import { bootstrapWorker } from './infra/worker/bootstrap-worker'

bootstrapWorker().catch((error: unknown) => {
  new Logger('WorkerBootstrap').error(
    'Fatal error during worker bootstrap',
    error instanceof Error ? error.stack : error,
  )
  process.exit(1)
})
