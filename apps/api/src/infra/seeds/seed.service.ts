import { faker } from '@faker-js/faker'
import { Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import type { Artist as NCSArtist, Song as NCSSong } from '@spotify/ncs-parser'
import * as ncs from '@spotify/ncs-parser'
import config from './config'
import { DownloadResourcesService } from './download-resources.service'
import { FakerService } from './faker.service'
import { createMulterFileFromPath } from './file-helper'

// Интерфейс для TracksService без привязки к seed
interface ITracksService {
  create(
    artistId: string,
    createTrackDto: { title: string },
    audioFile: Express.Multer.File,
    coverFile?: Express.Multer.File,
  ): Promise<{ id: string }>
}

/**
 * Главный сервис для заполнения базы данных
 */
export class SeedService {
  constructor(
    private prisma: PrismaClient,
    private downloadService: DownloadResourcesService,
    private tracksService: ITracksService,
  ) {}

  private readonly logger = new Logger(SeedService.name, { timestamp: true })

  /**
   * Создаёт или находит артиста в БД
   */
  private async upsertArtist(ncsArtist: NCSArtist) {
    const username = this.sanitizeUsername(ncsArtist.name)
    const email = `${username}@ncs-import.local`

    return await this.prisma.artist.upsert({
      where: { username },
      update: {},
      create: {
        username,
        email,
        password: 'ncs-imported',
        bio: `Artist imported from NoCopyrightSounds: ${ncsArtist.url}`,
        avatar: faker.image.avatar(),
        backgroundImage: faker.image.url({ width: 1920, height: 1080 }),
      },
    })
  }

  /**
   * Создаёт трек с файлами
   */
  private async createTrack(ncsSong: NCSSong, artistId: string) {
    // Проверяем дубликаты
    const existingTrack = await this.prisma.track.findFirst({
      where: { title: ncsSong.name, artistId },
    })

    if (existingTrack) {
      this.logger.log(`  ⏭️  Track "${ncsSong.name}" already exists, skipping...`)
      return existingTrack
    }

    // Скачиваем ресурсы
    const { audioFilePath, coverFilePath, instrumentalFilePath, duration } =
      await this.downloadService.downloadTrackResources(ncsSong)

    if (!audioFilePath) {
      throw new Error('No audio URL available for track')
    }

    // Создаём Multer-совместимые объекты из файлов
    const audioFile = createMulterFileFromPath(audioFilePath, 'audio')
    const coverFile = coverFilePath ? createMulterFileFromPath(coverFilePath, 'cover') : undefined

    // Создаём основной трек через стандартный метод TracksService
    const track = await this.tracksService.create(
      artistId,
      { title: ncsSong.name },
      audioFile,
      coverFile,
    )

    // Обновляем дополнительные поля, которые не поддерживаются в стандартном create
    await this.prisma.track.update({
      where: { id: track.id },
      data: {
        releaseDate: ncsSong.date,
        duration,
      },
    })

    // Если есть instrumental версия, создаём отдельный трек
    if (instrumentalFilePath) {
      try {
        const instrumentalAudioFile = createMulterFileFromPath(instrumentalFilePath, 'audio')
        const instrumentalTrack = await this.tracksService.create(
          artistId,
          { title: `${ncsSong.name} (Instrumental)` },
          instrumentalAudioFile,
          coverFile,
        )

        // Обновляем дополнительные поля для instrumental версии
        await this.prisma.track.update({
          where: { id: instrumentalTrack.id },
          data: {
            releaseDate: ncsSong.date,
            duration,
          },
        })

        this.logger.log('  🎹 Created instrumental version')
      } catch (error) {
        this.logger.warn(
          `  ⚠️  Failed to create instrumental version: ${error instanceof Error ? error.message : error}`,
        )
      }
    }

    return track
  }

  private sanitizeUsername(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 50)
  }

  /**
   * Импортирует артистов и треки из NCS
   */
  async importFromNCS() {
    this.logger.log('═══════════════════════════════════════')
    this.logger.log('📡 STEP 1: Importing from NCS')
    this.logger.log('═══════════════════════════════════════')

    const PAGES_TO_IMPORT = config.pagesToImport
    const DELAY_BETWEEN_PAGES = config.delayBetweenPages

    let totalTracksImported = 0
    let totalArtistsImported = 0
    const artistCache = new Map<string, string>()

    for (let page = 0; page < PAGES_TO_IMPORT; page++) {
      this.logger.log(`\n📄 Processing NCS page ${page + 1}/${PAGES_TO_IMPORT}...`)

      try {
        const songs = await ncs.search(config.filters, page)

        if (!songs || songs.length === 0) {
          this.logger.warn('  ⚠️  No songs found on this page, stopping...')
          break
        }

        this.logger.log(`  ✅ Found ${songs.length} songs`)
        for (const song of songs) {
          try {
            const primaryArtist = song.artists[0]

            if (!primaryArtist) {
              this.logger.warn(`  ⚠️  Skipping "${song.name}" - no artist information`)
              continue
            }

            let artistId = artistCache.get(primaryArtist.name)

            if (!artistId) {
              const artist = await this.upsertArtist(primaryArtist)
              artistId = artist.id
              artistCache.set(primaryArtist.name, artistId)
              totalArtistsImported++
              this.logger.log(`  👤 Created/found artist: ${primaryArtist.name}`)
            }

            await this.createTrack(song, artistId)
            totalTracksImported++
            this.logger.log(`  🎵 Imported track: ${song.name} by ${primaryArtist.name}`)
          } catch (error) {
            this.logger.error(
              `  ❌ Error processing song "${song.name}":`,
              error instanceof Error ? error.message : error,
            )
          }
        }

        if (page < PAGES_TO_IMPORT - 1) {
          this.logger.log(`  ⏳ Waiting ${DELAY_BETWEEN_PAGES}ms before next page...`)
          await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_PAGES))
        }
      } catch (error) {
        this.logger.error(
          `  ❌ Error fetching page ${page + 1}:`,
          error instanceof Error ? error.message : error,
        )
      }
    }

    return { totalTracksImported, totalArtistsImported }
  }

  /**
   * Создаёт альбомы для артистов (1 альбом = все треки артиста)
   */
  async createAlbumsForArtists() {
    this.logger.log('\n═══════════════════════════════════════')
    this.logger.log('📀 STEP 2: Creating albums for artists')
    this.logger.log('═══════════════════════════════════════')

    const artists = await this.prisma.artist.findMany({
      include: {
        tracks: { select: { id: true, releaseDate: true } },
      },
    })

    let albumsCreated = 0

    for (const artist of artists) {
      if (artist.tracks.length === 0) {
        continue
      }

      // Находим самую раннюю дату релиза треков как дату релиза альбома
      const releaseDates = artist.tracks
        .map((t) => t.releaseDate)
        .filter((d): d is Date => d !== null)
      const albumReleaseDate =
        releaseDates.length > 0
          ? new Date(Math.min(...releaseDates.map((d) => d.getTime())))
          : new Date()

      // Создаём один альбом со всеми треками артиста
      const album = await this.prisma.album.create({
        data: {
          title: `${artist.username} - Complete Collection`,
          cover: faker.image.url({ width: 1000, height: 1000 }),
          artistId: artist.id,
          releaseDate: albumReleaseDate,
          description: `All tracks by ${artist.username}`,
          tracks: {
            connect: artist.tracks.map((track) => ({ id: track.id })),
          },
        },
      })

      albumsCreated++
      this.logger.log(`📀 Created album "${album.title}" with ${artist.tracks.length} tracks`)
    }

    this.logger.log(`✅ Created ${albumsCreated} albums`)
    return albumsCreated
  }

  /**
   * Создаёт пользователей
   */
  async createUsers(count: number = 50) {
    this.logger.log('\n═══════════════════════════════════════')
    this.logger.log('👥 STEP 3: Creating users')
    this.logger.log('═══════════════════════════════════════')

    const users = FakerService.generateUsers(count)
    await this.prisma.user.createMany({ data: users, skipDuplicates: true })
    this.logger.log(`✅ Seeded ${count} users`)
  }

  /**
   * Создаёт плейлисты из существующих треков для пользователей
   */
  async createPlaylistsForUsers(playlistCount: number = 100) {
    this.logger.log('\n═══════════════════════════════════════')
    this.logger.log('🎵 STEP 4: Creating playlists')
    this.logger.log('═══════════════════════════════════════')

    const users = await this.prisma.user.findMany({ select: { id: true } })
    const tracks = await this.prisma.track.findMany({ select: { id: true } })

    if (users.length === 0) {
      this.logger.log('⚠️ No users found. Skipping playlists.')
      return
    }

    if (tracks.length === 0) {
      this.logger.log('⚠️ No tracks found. Skipping playlists.')
      return
    }

    const userIds = users.map((u) => u.id)
    const playlists = FakerService.generatePlaylists(userIds, playlistCount)

    await this.prisma.playlist.createMany({ data: playlists, skipDuplicates: true })
    this.logger.log(`✅ Created ${playlistCount} playlists`)

    // Добавляем треки в плейлисты
    this.logger.log('🔗 Adding tracks to playlists...')
    const createdPlaylists = await this.prisma.playlist.findMany({ select: { id: true } })

    let totalTracksAdded = 0

    for (const playlist of createdPlaylists) {
      const tracksCount = faker.number.int({ min: 10, max: 50 })
      const playlistTracks = faker.helpers.arrayElements(tracks, tracksCount)

      for (const track of playlistTracks) {
        try {
          await this.prisma.playlist.update({
            where: { id: playlist.id },
            data: { tracks: { connect: { id: track.id } } },
          })
          totalTracksAdded++
        } catch {
          // Игнорируем дубликаты
        }
      }
    }

    this.logger.log(`✅ Added ${totalTracksAdded} track-playlist relations`)
  }

  /**
   * Создаёт лайки пользователей
   */
  async createUserLikes() {
    this.logger.log('\n═══════════════════════════════════════')
    this.logger.log('❤️  STEP 5: Adding user liked tracks')
    this.logger.log('═══════════════════════════════════════')

    const users = await this.prisma.user.findMany({ select: { id: true } })
    const tracks = await this.prisma.track.findMany({ select: { id: true } })

    if (users.length === 0 || tracks.length === 0) {
      this.logger.log('⚠️ No users or tracks found.')
      return
    }

    let totalLikes = 0

    for (const user of users) {
      const likesCount = faker.number.int({ min: 5, max: 50 })
      const likedTracks = faker.helpers.arrayElements(tracks, likesCount)

      for (const track of likedTracks) {
        try {
          await this.prisma.user.update({
            where: { id: user.id },
            data: { likedTracks: { connect: { id: track.id } } },
          })
          totalLikes++
        } catch {
          // Игнорируем дубликаты
        }
      }
    }

    this.logger.log(`✅ Created ${totalLikes} liked track relations`)
  }

  /**
   * Очищает базу данных
   */
  async clearDatabase() {
    this.logger.log('🗑️  Clearing existing data...')
    await this.prisma.playlist.deleteMany()
    await this.prisma.userSession.deleteMany()
    await this.prisma.artistSession.deleteMany()
    await this.prisma.user.deleteMany()
    await this.prisma.track.deleteMany()
    await this.prisma.album.deleteMany()
    await this.prisma.artist.deleteMany()
    this.logger.log('✅ Database cleared\n')
  }

  /**
   * Выводит финальную статистику
   */
  async printStats(stats: { totalTracksImported: number; totalArtistsImported: number }) {
    this.logger.log('\n═══════════════════════════════════════')
    this.logger.log('📊 FINAL SUMMARY')
    this.logger.log('═══════════════════════════════════════')

    const dbStats = {
      artists: await this.prisma.artist.count(),
      tracks: await this.prisma.track.count(),
      albums: await this.prisma.album.count(),
      users: await this.prisma.user.count(),
      playlists: await this.prisma.playlist.count(),
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
  }
}
