import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx src/infra/seeds/seed-with-relations.ts',
  },
  datasource: {
    url: env('DATABASE_URL')
  },
})
