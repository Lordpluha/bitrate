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
  private prisma: PrismaClient
  private pool: Pool

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })
    const adapter = new PrismaPg(this.pool)
    this.prisma = new PrismaClient({ adapter })
  }

  async onModuleInit() {
    await this.prisma.$connect()
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect()
    await this.pool.end()
  }

  // Proxy all PrismaClient methods
  get user() {
    return this.prisma.user
  }

  get userSession() {
    return this.prisma.userSession
  }

  get artistSession() {
    return this.prisma.artistSession
  }

  get track() {
    return this.prisma.track
  }

  get artist() {
    return this.prisma.artist
  }

  get album() {
    return this.prisma.album
  }

  get playlist() {
    return this.prisma.playlist
  }

  get trackFile() {
    return this.prisma.trackFile
  }

  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma)
  }
}
