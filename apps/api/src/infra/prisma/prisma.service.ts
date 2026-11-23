import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { type Prisma, PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

/**
 * Columns no query returns unless it selects them explicitly. `Track.audioUrl` is the master's
 * storage key: ingest and processing select it, but it must never reach a response (#522).
 *
 * Applied at runtime only. Passing it as `PrismaClient`'s type argument would also narrow the
 * result types, but it blows up type instantiation across the deep transaction mocks in specs.
 * So the generated types still list `audioUrl` on a query without `select` — read it only with
 * `select: { audioUrl: true }`, as every current reader does.
 */
export const PRISMA_GLOBAL_OMIT = {
  track: { audioUrl: true },
} as const satisfies Prisma.GlobalOmitConfig

/**
 * The application's Prisma client. Extending `PrismaClient` exposes every model delegate
 * directly, so a new model in `schema.prisma` needs no change here.
 *
 * If you have error - regenerate PrismaClient
 * Command: `pnpm db:gen`
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /** The pool value. */
  private readonly pool: Pool

  /** Creates a new instance. */
  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })
    super({ adapter: new PrismaPg(pool), omit: PRISMA_GLOBAL_OMIT })
    this.pool = pool
  }

  /** Runs the on module init operation. */
  async onModuleInit() {
    await this.$connect()
  }

  /** Runs the on module destroy operation. */
  async onModuleDestroy() {
    await this.$disconnect()
    await this.pool.end()
  }

  /** Runs the query raw operation. */
  queryRaw<T>(sql: Parameters<PrismaClient['$queryRaw']>[0]): Promise<T> {
    return this.$queryRaw<T>(sql as never)
  }

  /** Runs a parameterized data-changing raw statement. */
  executeRaw(sql: Parameters<PrismaClient['$executeRaw']>[0]): Promise<number> {
    return this.$executeRaw(sql as never)
  }

  /** Verifies that PostgreSQL accepts queries. */
  async ping(): Promise<boolean> {
    await this.$queryRaw`SELECT 1`
    return true
  }
}
