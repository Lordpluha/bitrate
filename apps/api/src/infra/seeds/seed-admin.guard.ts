/**
 * Side-effect-free environment guard for `seed-admin.ts`. Split out so it can be unit-tested
 * without importing the entrypoint module — an entrypoint that runs `main()` on import (even one
 * that immediately refuses in most environments) is exactly what a spec must never trigger, so
 * the guard itself carries zero top-level side effects: no `bootstrap-env` import, no Prisma, no
 * `process.exit`.
 */

/** Database hosts treated as local — see the docker-compose service names below. */
const LOCAL_DATABASE_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  /** `infra/docker-compose.dev.yaml` / `infra/docker-compose.preprod.yaml` service name. */
  'postgres',
  /** `infra/docker-compose.dev.yaml`'s test-database service name. */
  'postgres_test',
  /** `infra/docker-compose.preprod.yaml`'s `postgres` container name — also a valid DNS alias
   * on the compose network. */
  'bitrate-postgres',
])

/**
 * Describes a `DATABASE_URL` for an error message without ever echoing credentials — only the
 * parsed hostname, or why it couldn't be determined.
 */
function describeDatabaseHost(databaseUrl: string | undefined): string {
  if (!databaseUrl) return 'no DATABASE_URL set'

  try {
    const hostname = new URL(databaseUrl).hostname
    return hostname || 'a DATABASE_URL with no host'
  } catch {
    return 'an unparseable DATABASE_URL'
  }
}

/** A malformed or missing `DATABASE_URL` is never treated as local — refuse rather than guess. */
function isLocalDatabaseHost(databaseUrl: string | undefined): boolean {
  if (!databaseUrl) return false

  try {
    return LOCAL_DATABASE_HOSTS.has(new URL(databaseUrl).hostname)
  } catch {
    return false
  }
}

/**
 * Refuses to seed admin-panel fixtures anywhere but a database this script's own docker-compose
 * infrastructure would produce. Two independent checks, evaluated in order:
 *
 * 1. `NODE_ENV=production` is refused unconditionally — no override exists. Fixture data (reports,
 *    deactivated accounts, a fixture staff password) has no legitimate production use.
 * 2. Outside production, `DATABASE_URL`'s host must be one this repo's own infra could have
 *    produced (`localhost`, `127.0.0.1`, `::1`, or the `postgres`/`postgres_test`/`bitrate-postgres`
 *    docker-compose service/container names) — otherwise the run is refused unless
 *    `ADMIN_FIXTURES_ALLOW_REMOTE_DB=true` is set explicitly. A missing or unparseable
 *    `DATABASE_URL` is treated as non-local, never as "assume it's fine".
 *
 * Exported (rather than inlined in `main`) so it can be unit-tested without touching a database.
 *
 * @throws {Error} when `NODE_ENV=production`, or when `DATABASE_URL` is not a recognised local
 * host and `ADMIN_FIXTURES_ALLOW_REMOTE_DB` is not `'true'`.
 */
export function assertAllowedEnvironment(env: NodeJS.ProcessEnv = process.env): void {
  if (env.NODE_ENV === 'production') {
    throw new Error(
      'Refusing to seed admin-panel fixtures with NODE_ENV=production. Fixture data has no ' +
        'legitimate production use — this refusal has no override.',
    )
  }

  if (isLocalDatabaseHost(env.DATABASE_URL)) return
  if (env.ADMIN_FIXTURES_ALLOW_REMOTE_DB === 'true') return

  throw new Error(
    `Refusing to seed admin-panel fixtures against a non-local database (${describeDatabaseHost(env.DATABASE_URL)}). ` +
      'Set ADMIN_FIXTURES_ALLOW_REMOTE_DB=true to override this — production is refused ' +
      'regardless, with no override at all.',
  )
}
