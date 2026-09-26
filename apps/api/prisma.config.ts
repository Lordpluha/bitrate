import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseEnv } from 'node:util'
import { defineConfig, env } from 'prisma/config'

/**
 * Loads `.env` then `.env.local`, first file to define a variable wins and a real shell variable
 * beats both — the same order as the API's `ConfigModule` and the seeds' `bootstrap-env.ts`.
 * `dotenv/config` read only `.env`, so a checkout carrying just `.env.local` failed
 * `prisma generate` (and with it `pnpm build` and the pre-push hook) on an unset `DATABASE_URL`.
 * Inlined rather than imported from `src/`: the production image copies this file without `src/`.
 */
for (const name of ['.env', '.env.local']) {
  const path = resolve(__dirname, name)
  if (!existsSync(path)) continue
  for (const [key, value] of Object.entries(parseEnv(readFileSync(path, 'utf8')))) {
    process.env[key] ??= value
  }
}

/**
 * Optional — only `prisma migrate dev` needs a shadow database, and production runs
 * `migrate deploy`. Read from `process.env` rather than Prisma's `env()`, which throws on a
 * missing variable instead of returning undefined: the conditional spread below could therefore
 * never see a falsy value, and loading the config simply failed wherever the variable was unset.
 */
const shadowDatabaseUrl = process.env.SHADOW_DATABASE_URL

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'cross-env TS_NODE_PROJECT=tsconfig.seed.json node -r ts-node/register/transpile-only -r tsconfig-paths/register src/infra/seeds/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
    ...(shadowDatabaseUrl ? { shadowDatabaseUrl } : {}),
  },
})
