import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

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
    super({ adapter: new PrismaPg(pool) })
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
