/**
 * Whether `AudioProcessingConsumer`'s BullMQ worker autoruns — extracted so the decision is
 * unit-testable without reloading the module under a different `process.env`.
 *
 * Read directly rather than through `AppConfig`: `@Processor`'s options are evaluated at
 * class-definition time, before Nest's DI container (and therefore `ConfigService`) exists.
 * `env.schema.ts` still validates `AUDIO_PROCESSING_WORKER_ENABLED` for documentation and to
 * fail fast on a bad value — this reads the same variable directly because it must run
 * before that validation has necessarily happened.
 */
export function isAudioProcessingWorkerAutorunEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env.AUDIO_PROCESSING_WORKER_ENABLED !== 'false'
}
