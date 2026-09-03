import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

/**
 * Optional — only `prisma migrate dev` needs a shadow database, and production runs
 * `migrate deploy`. Read from `process.env` rather than Prisma's `env()`, which throws on a
 * missing variable instead of returning undefined: the conditional spread below could therefore
 * never see a falsy value, and loading the config simply failed wherever the variable was unset.
 * `dotenv/config` above has already merged any .env file into `process.env`.
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
