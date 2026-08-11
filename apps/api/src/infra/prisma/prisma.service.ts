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

  /** Gets user email verification records. */
  get userEmailVerification() {
    return this.prisma.userEmailVerification
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

  /** Gets artist email verification records. */
  get artistEmailVerification() {
    return this.prisma.artistEmailVerification
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

  /** Gets explicit playlist memberships. */
  get playlistTrack() {
    return this.prisma.playlistTrack
  }
  /** Gets explicit album memberships. */
  get albumTrack() {
    return this.prisma.albumTrack
  }
  /** Gets liked track records. */
  get userLikedTrack() {
    return this.prisma.userLikedTrack
  }
  /** Gets liked album records. */
  get userLikedAlbum() {
    return this.prisma.userLikedAlbum
  }
  /** Gets liked playlist records. */
  get userLikedPlaylist() {
    return this.prisma.userLikedPlaylist
  }
  /** Gets liked artist records. */
  get userLikedArtist() {
    return this.prisma.userLikedArtist
  }
  /** Gets followed artist records. */
  get userFollowedArtist() {
    return this.prisma.userFollowedArtist
  }
  /** Gets user follow records. */
  get userFollow() {
    return this.prisma.userFollow
  }
  /** Gets track artist credits. */
  get trackArtist() {
    return this.prisma.trackArtist
  }
  /** Gets genres. */
  get genre() {
    return this.prisma.genre
  }
  /** Gets track genre records. */
  get trackGenre() {
    return this.prisma.trackGenre
  }
  /** Gets album genre records. */
  get albumGenre() {
    return this.prisma.albumGenre
  }
  /** Gets artist genre records. */
  get artistGenre() {
    return this.prisma.artistGenre
  }
  /** Gets user settings. */
  get userSettings() {
    return this.prisma.userSettings
  }
  /** Gets search history records. */
  get searchHistory() {
    return this.prisma.searchHistory
  }
  /** Gets notifications. */
  get notification() {
    return this.prisma.notification
  }
  /** Gets player devices. */
  get playerDevice() {
    return this.prisma.playerDevice
  }
  /** Gets persisted player state. */
  get playerState() {
    return this.prisma.playerState
  }
  /** Gets player queue entries. */
  get playerQueueItem() {
    return this.prisma.playerQueueItem
  }
  /** Gets subscriptions. */
  get subscription() {
    return this.prisma.subscription
  }
  /** Gets podcasts. */
  get podcast() {
    return this.prisma.podcast
  }
  /** Gets podcast episodes. */
  get episode() {
    return this.prisma.episode
  }
  /** Gets saved episode records. */
  get userSavedEpisode() {
    return this.prisma.userSavedEpisode
  }
  /** Gets moderation reports. */
  get moderationReport() {
    return this.prisma.moderationReport
  }
  /** Gets audit records. */
  get auditLog() {
    return this.prisma.auditLog
  }

  /** Gets the $transaction. */
  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma)
  }

  /** Runs the query raw operation. */
  queryRaw<T>(sql: Parameters<PrismaClient['$queryRaw']>[0]): Promise<T> {
    return this.prisma.$queryRaw<T>(sql as never)
  }

  /** Verifies that PostgreSQL accepts queries. */
  async ping(): Promise<boolean> {
    await this.prisma.$queryRaw`SELECT 1`
    return true
  }
}
