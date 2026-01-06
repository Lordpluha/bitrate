import { config } from 'dotenv'
import type { PrismaConfig } from 'prisma'

// Load environment variables
config()

export default {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
} satisfies PrismaConfig
