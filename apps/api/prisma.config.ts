import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

const shadowDatabaseUrl = env('SHADOW_DATABASE_URL') || process.env.SHADOW_DATABASE_URL

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx src/infra/seeds/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
    ...(shadowDatabaseUrl ? { shadowDatabaseUrl } : {}),
  },
})
