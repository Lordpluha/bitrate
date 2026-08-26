import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

/** The shadow database url value. */
const shadowDatabaseUrl = process.env.SHADOW_DATABASE_URL || env('SHADOW_DATABASE_URL')

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
