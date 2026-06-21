import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

/**
 * If you have error - regenerate PrismaClient
 * Command: `pnpm db:gen`
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  /** The prisma value. */
  private prisma: PrismaClient
  /** The pool value. */
  private pool: Pool

  /** Creates a new instance. */
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })
    const adapter = new PrismaPg(this.pool)
    this.prisma = new PrismaClient({ adapter })
  }

  /** Runs the on module init operation. */
  async onModuleInit() {
    await this.prisma.$connect()
  }

  /** Runs the on module destroy operation. */
  async onModuleDestroy() {
    await this.prisma.$disconnect()
    await this.pool.end()
  }

  // Proxy all PrismaClient methods
  /** Gets the user. */
  get user() {
    return this.prisma.user
  }

  /** Gets the user session. */
  get userSession() {
    return this.prisma.userSession
  }

  /** Gets the user password reset. */
  get userPasswordReset() {
    return this.prisma.userPasswordReset
  }

  /** Gets the user oauth account. */
  get userOAuthAccount() {
    return this.prisma.userOAuthAccount
  }

  /** Gets the artist session. */
  get artistSession() {
    return this.prisma.artistSession
  }

  /** Gets the artist oauth account. */
  get artistOAuthAccount() {
    return this.prisma.artistOAuthAccount
  }

  /** Gets the artist password reset. */
  get artistPasswordReset() {
    return this.prisma.artistPasswordReset
  }

  /** Gets the track. */
  get track() {
    return this.prisma.track
  }

  /** Gets the artist. */
  get artist() {
    return this.prisma.artist
  }

  /** Gets the album. */
  get album() {
    return this.prisma.album
  }

  /** Gets the playlist. */
  get playlist() {
    return this.prisma.playlist
  }

  /** Gets the track file. */
  get trackFile() {
    return this.prisma.trackFile
  }

  /** Gets the listening history. */
  get listeningHistory() {
    return this.prisma.listeningHistory
  }

  /** Gets the $transaction. */
  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma)
  }

  /** Runs the query raw operation. */
  queryRaw<T>(sql: Parameters<PrismaClient['$queryRaw']>[0]): Promise<T> {
    return this.prisma.$queryRaw<T>(sql as never)
  }
}
