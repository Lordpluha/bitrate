import { config } from 'dotenv'
import type { PrismaConfig } from 'prisma'

// Load environment variables
config()

export default {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx src/infra/seeds/seed-with-relations.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
} satisfies PrismaConfig
