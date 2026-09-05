import { Logger } from '@nestjs/common'
import type { PrismaClient } from '@prisma/client'
import type { DownloadResourcesService } from './download-resources.service'
import type { FakerService } from './faker.service'
import { CatalogSeeder } from './seeders/catalog.seeder'
import { LibrarySeeder } from './seeders/library.seeder'
import { NcsImportSeeder } from './seeders/ncs-import.seeder'
import { PodcastSeeder } from './seeders/podcast.seeder'
import type { IPasswordHasher, ITrackUploadService, NcsImportStats } from './seeders/seed.types'

const BANNER = '═══════════════════════════════════════'

/**
 * Главный сервис для заполнения базы данных.
 *
 * Каждый шаг живёт в своём сидере; здесь остаются порядок шагов, очистка базы
 * и итоговая статистика.
 */
export class SeedService {
  private readonly ncsImport: NcsImportSeeder
  private readonly catalog: CatalogSeeder
  private readonly library: LibrarySeeder
  private readonly podcasts: PodcastSeeder

  /** Creates a new instance. */
  constructor(
    private readonly prisma: PrismaClient,
    downloadService: DownloadResourcesService,
    fakerService: FakerService,
    trackUploadService: ITrackUploadService,
    passwordHasher: IPasswordHasher,
  ) {
    this.ncsImport = new NcsImportSeeder(prisma, downloadService, trackUploadService)
    this.catalog = new CatalogSeeder(prisma)
    this.library = new LibrarySeeder(prisma, fakerService, passwordHasher)
    this.podcasts = new PodcastSeeder(prisma)
  }

  /** The logger value. */
  private readonly logger = new Logger(SeedService.name, { timestamp: true })

  /** Prints a step banner and runs the step behind it. */
  private async step<T>(title: string, run: () => Promise<T>): Promise<T> {
    this.logger.log(`\n${BANNER}`)
    this.logger.log(title)
    this.logger.log(BANNER)
    return await run()
  }

  /** Импортирует артистов и треки из NCS. */
  async importFromNCS(): Promise<NcsImportStats> {
    return await this.step('📡 STEP 1: Importing from NCS', () => this.ncsImport.run())
  }

  /** Creates the genre catalogue and links it to imported tracks and artists. */
  async createCatalogMetadata() {
    return await this.step('🏷️  STEP 2: Creating genres and credits', () =>
      this.catalog.createCatalogMetadata(),
    )
  }

  /** Создаёт альбомы для артистов (1 альбом = все треки артиста). */
  async createAlbumsForArtists() {
    return await this.step('📀 STEP 3: Creating albums for artists', () =>
      this.catalog.createAlbumsForArtists(),
    )
  }

  /** Создаёт пользователей. */
  async createUsers(count = 50) {
    return await this.step('👥 STEP 4: Creating users', () => this.library.createUsers(count))
  }

  /** Создаёт плейлисты из существующих треков для пользователей. */
  async createPlaylistsForUsers(playlistCount = 100) {
    return await this.step('🎵 STEP 5: Creating playlists', () =>
      this.library.createPlaylistsForUsers(playlistCount),
    )
  }

  /** Создаёт лайки пользователей. */
  async createUserLikes() {
    return await this.step('❤️  STEP 6: Creating user libraries and activity', () =>
      this.library.createUserLikes(),
    )
  }

  /** Creates podcasts, episodes and saved episode relations for library screens. */
  async createPodcasts() {
    return await this.step('🎙️  STEP 7: Creating podcasts and episodes', () =>
      this.podcasts.createPodcasts(),
    )
  }

  /** Очищает базу данных. */
  async clearDatabase() {
    this.logger.log('🗑️  Clearing existing data...')
    await this.prisma.$transaction([
      this.prisma.auditLog.deleteMany(),
      this.prisma.moderationReport.deleteMany(),
      this.prisma.podcast.deleteMany(),
      this.prisma.user.deleteMany(),
      this.prisma.album.deleteMany(),
      this.prisma.track.deleteMany(),
      this.prisma.artist.deleteMany(),
      this.prisma.genre.deleteMany(),
    ])
    this.logger.log('✅ Database cleared\n')
  }

  /** Выводит финальную статистику. */
  async printStats(stats: NcsImportStats) {
    this.logger.log(`\n${BANNER}`)
    this.logger.log('📊 FINAL SUMMARY')
    this.logger.log(BANNER)

    const dbStats = {
      artists: await this.prisma.artist.count(),
      tracks: await this.prisma.track.count(),
      albums: await this.prisma.album.count(),
      users: await this.prisma.user.count(),
      playlists: await this.prisma.playlist.count(),
      genres: await this.prisma.genre.count(),
      podcasts: await this.prisma.podcast.count(),
      episodes: await this.prisma.episode.count(),
      history: await this.prisma.listeningHistory.count(),
    }

    this.logger.log(
      `👤 Artists (from NCS):     ${stats.totalArtistsImported} imported, ${dbStats.artists} total`,
    )
    this.logger.log(
      `🎵 Tracks (from NCS):      ${stats.totalTracksImported} imported, ${dbStats.tracks} total`,
    )
    this.logger.log(`📀 Albums:                 ${dbStats.albums}`)
    this.logger.log(`👥 Users (faker):          ${dbStats.users}`)
    this.logger.log(`🎵 Playlists (faker):      ${dbStats.playlists}`)
    this.logger.log(`🏷️  Genres:                 ${dbStats.genres}`)
    this.logger.log(`🎙️  Podcasts / episodes:    ${dbStats.podcasts} / ${dbStats.episodes}`)
    this.logger.log(`🕘 Listening history:       ${dbStats.history}`)
  }
}
