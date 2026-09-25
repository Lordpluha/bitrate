import { resolve } from 'node:path'
import { loadEnvFiles } from './load-env-files'

/**
 * Side-effect module — loads `.env` then `.env.local` (first one to define a variable wins,
 * a real shell variable beats both, a missing file is skipped) into `process.env` before
 * anything else in a seed entrypoint runs.
 *
 * Matches `apps/api`'s own `ConfigModule` (`envFilePath: ['.env', '.env.local', …]` in
 * `app.module.ts`, first entry wins), so a seed always targets the same database the API itself
 * would. `apps/api` ships no `.env` by default, only `.env.local`, `.env.test` and `.env.example`,
 * so a bare `import 'dotenv/config'` (which reads only `.env`) leaves `DATABASE_URL` and friends
 * unset here. This replaces that import.
 *
 * Import this as the **first** import in a seed entrypoint — not merely "somewhere among the
 * imports". A module's own top-level code that reads `process.env` at load time runs only after
 * that module's own imports finish, but an *imported* module's top-level code can itself read
 * `process.env` immediately when it is required — `admin-auth.guard.ts:40` does exactly this.
 * If `bootstrap-env` were not the first import, a module required ahead of it could already have
 * read an unset variable before this ever ran. Putting it first is a correctness requirement,
 * not a readability preference.
 */
loadEnvFiles({ root: resolve(__dirname, '../../..'), files: ['.env', '.env.local'] })

/**
 * `seed.ts` boots the full `AppModule`, which pulls in `TracksModule` and therefore
 * `AudioProcessingConsumer`'s BullMQ worker. Without this, that worker claims and runs the
 * very conversion jobs the seed itself enqueues, and the seed process exits (closing the
 * Nest context and the DB pool) while those jobs are still mid-flight — they stall in Redis
 * until BullMQ's stall detection eventually fails them.
 *
 * Read directly off `process.env` (not through the validated config, which does not exist
 * yet at this point in a seed entrypoint) and only fills the gap — an explicit
 * `AUDIO_PROCESSING_WORKER_ENABLED` already in the environment is never overridden, so a
 * developer can still opt back in locally. `seed-staff.ts` and `seed-admin.ts` import this
 * file too but never boot `AppModule`, so the flag is inert for them.
 */
process.env.AUDIO_PROCESSING_WORKER_ENABLED ??= 'false'
