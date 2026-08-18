import { faker } from '@faker-js/faker'
import { Logger } from '@nestjs/common'
import { type Genre, PrismaClient } from '@prisma/client'
import type { Artist as NCSArtist, Song as NCSSong } from '@spotify/ncs-parser'
import * as ncs from '@spotify/ncs-parser'
import config from './config'
import { DownloadResourcesService } from './download-resources.service'
import { FakerService } from './faker.service'
import { createMulterFileFromPath } from './file-helper'
import { SEED_GENRES, SEED_PASSWORD, SEED_PODCASTS, SEED_SEARCH_QUERIES } from './seed.data'

// Интерфейс для TracksService без привязки к seed
interface ITracksService {
  create(
    artistId: string,
    createTrackDto: { title: string },
    audioFile: Express.Multer.File,
    coverFile?: Express.Multer.File,
  ): Promise<{ id: string }>
}

interface IPasswordHasher {
  hashPassword(password: string): Promise<string>
}

/**
 * Главный сервис для заполнения базы данных
 */
export class SeedService {
  /** Creates a new instance. */
  constructor(
    private prisma: PrismaClient,
    private downloadService: DownloadResourcesService,
    private faker: FakerService,
    private tracksService: ITracksService,
    private passwordHasher: IPasswordHasher,
  ) {}

  /** The logger value. */
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
        password: null,
        bio: `Artist imported from NoCopyrightSounds: ${ncsArtist.url}`,
        avatar: faker.image.avatar(),
        backgroundImage: faker.image.url({ width: 1920, height: 1080 }),
        emailVerifiedAt: new Date(),
        verified: faker.datatype.boolean({ probability: 0.35 }),
        monthlyListeners: faker.number.int({ min: 10_000, max: 2_000_000 }),
      },
    })
  }

  /**
   * Создаёт трек и ставит задачу конвертации в очередь
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
    const { audioFilePath, coverFilePath, instrumentalFilePath } =
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

    // Обновляем дополнительные поля, которые не поддерживаются в стандартном create.
    // duration здесь не трогаем — create уже записал настоящую длительность файла.
    await this.prisma.track.update({
      where: { id: track.id },
      data: {
        releaseDate: ncsSong.date,
      },
    })
    await this.ensurePrimaryArtistCredit(track.id, artistId)

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

        // Обновляем дополнительные поля для instrumental версии.
        // duration не трогаем: у instrumental своя длительность, и раньше сюда
        // копировалось значение основного трека.
        await this.prisma.track.update({
          where: { id: instrumentalTrack.id },
          data: {
            releaseDate: ncsSong.date,
          },
        })
        await this.ensurePrimaryArtistCredit(instrumentalTrack.id, artistId)

        this.logger.log('  🎹 Created instrumental version')
      } catch (error) {
        this.logger.warn(
          `  ⚠️  Failed to create instrumental version: ${error instanceof Error ? error.message : error}`,
        )
      }
    }

    return track
  }

  private async ensurePrimaryArtistCredit(trackId: string, artistId: string) {
    await this.prisma.trackArtist.upsert({
      where: { trackId_artistId: { trackId, artistId } },
      update: { isPrimary: true, position: 0 },
      create: { trackId, artistId, isPrimary: true, position: 0 },
    })
  }

  /** Runs the sanitize username operation. */
  private sanitizeUsername(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 50)
  }

  private sample<T>(items: T[], min: number, max: number): T[] {
    if (items.length === 0) return []
    const count = Math.min(
      items.length,
      faker.number.int({ min: Math.min(min, items.length), max }),
    )
    return faker.helpers.arrayElements(items, count)
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

  /** Creates the genre catalogue and links it to imported tracks and artists. */
  async createCatalogMetadata() {
    this.logger.log('\n═══════════════════════════════════════')
    this.logger.log('🏷️  STEP 2: Creating genres and credits')
    this.logger.log('═══════════════════════════════════════')

    const genres: Genre[] = []
    for (const genre of SEED_GENRES) {
      genres.push(
        await this.prisma.genre.upsert({
          where: { slug: genre.slug },
          update: { name: genre.name, color: genre.color },
          create: {
            ...genre,
            description: `Discover ${genre.name.toLowerCase()} tracks, artists and releases.`,
            cover: faker.image.url({ width: 800, height: 800 }),
          },
        }),
      )
    }

    const tracks = await this.prisma.track.findMany({ select: { id: true, artistId: true } })
    const artistByTrackId = new Map(tracks.map((track) => [track.id, track.artistId]))
    const trackGenres = tracks.flatMap((track) =>
      faker.helpers
        .arrayElements(genres, Math.min(genres.length, faker.number.int({ min: 1, max: 2 })))
        .map((genre) => ({ trackId: track.id, genreId: genre.id })),
    )

    await this.prisma.trackGenre.createMany({ data: trackGenres, skipDuplicates: true })
    await this.prisma.trackArtist.createMany({
      data: tracks.map((track) => ({
        trackId: track.id,
        artistId: track.artistId,
        position: 0,
        isPrimary: true,
      })),
      skipDuplicates: true,
    })

    const artistGenres = [
      ...new Map(
        trackGenres.map((item) => {
          const artistId = artistByTrackId.get(item.trackId)!
          return [`${artistId}:${item.genreId}`, { artistId, genreId: item.genreId }]
        }),
      ).values(),
    ]
    await this.prisma.artistGenre.createMany({ data: artistGenres, skipDuplicates: true })

    this.logger.log(`✅ Linked ${tracks.length} tracks to ${genres.length} genres`)
  }

  /**
   * Создаёт альбомы для артистов (1 альбом = все треки артиста)
   */
  async createAlbumsForArtists() {
    this.logger.log('\n═══════════════════════════════════════')
    this.logger.log('📀 STEP 3: Creating albums for artists')
    this.logger.log('═══════════════════════════════════════')

    const artists = await this.prisma.artist.findMany({
      include: {
        tracks: {
          orderBy: [{ releaseDate: 'asc' }, { createdAt: 'asc' }],
          select: { id: true, releaseDate: true, cover: true },
        },
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

      const title = `${artist.username} - Complete Collection`
      const existingAlbum = await this.prisma.album.findFirst({
        where: { artistId: artist.id, title, deletedAt: null },
      })
      if (existingAlbum) continue

      const album = await this.prisma.$transaction(async (tx) => {
        const createdAlbum = await tx.album.create({
          data: {
            title,
            cover:
              artist.tracks.find((track) => track.cover)?.cover ??
              faker.image.url({ width: 1000, height: 1000 }),
            artistId: artist.id,
            releaseDate: albumReleaseDate,
            description: `All tracks by ${artist.username}`,
            type: artist.tracks.length <= 3 ? 'EP' : 'ALBUM',
            label: 'NoCopyrightSounds',
            totalTracks: artist.tracks.length,
            copyright: `© ${albumReleaseDate.getFullYear()} ${artist.username}`,
          },
        })

        await tx.albumTrack.createMany({
          data: artist.tracks.map((track, index) => ({
            albumId: createdAlbum.id,
            trackId: track.id,
            trackNumber: index + 1,
            discNumber: 1,
          })),
        })

        const genreIds = await tx.trackGenre.findMany({
          where: { trackId: { in: artist.tracks.map((track) => track.id) } },
          distinct: ['genreId'],
          select: { genreId: true },
        })
        await tx.albumGenre.createMany({
          data: genreIds.map(({ genreId }) => ({ albumId: createdAlbum.id, genreId })),
          skipDuplicates: true,
        })
        return createdAlbum
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
    this.logger.log('👥 STEP 4: Creating users')
    this.logger.log('═══════════════════════════════════════')

    const passwordHash = await this.passwordHasher.hashPassword(SEED_PASSWORD)
    const users = this.faker.generateUsers(count, passwordHash)
    await this.prisma.user.createMany({ data: users, skipDuplicates: true })

    const createdUsers = await this.prisma.user.findMany({ select: { id: true } })
    await this.prisma.userSettings.createMany({
      data: createdUsers.map((user) => ({ userId: user.id })),
      skipDuplicates: true,
    })
    await this.prisma.subscription.createMany({
      data: createdUsers.map((user, index) => ({
        userId: user.id,
        plan: index % 8 === 0 ? 'PREMIUM_INDIVIDUAL' : 'FREE',
        status: 'ACTIVE',
      })),
    })

    this.logger.log(`✅ Seeded ${createdUsers.length} verified users with settings`)
    this.logger.log(`🔐 Demo login: test@example.com / ${SEED_PASSWORD}`)
  }

  /**
   * Создаёт плейлисты из существующих треков для пользователей
   */
  async createPlaylistsForUsers(playlistCount: number = 100) {
    this.logger.log('\n═══════════════════════════════════════')
    this.logger.log('🎵 STEP 5: Creating playlists')
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
    const playlists = this.faker.generatePlaylists(userIds, playlistCount)

    let totalTracksAdded = 0

    for (const playlist of playlists) {
      const trackCount = Math.min(tracks.length, faker.number.int({ min: 8, max: 24 }))
      const selectedTracks = faker.helpers.arrayElements(tracks, trackCount)
      await this.prisma.playlist.create({
        data: {
          ...playlist,
          followersCount: playlist.isPublic ? faker.number.int({ min: 0, max: 50_000 }) : 0,
          tracks: {
            create: selectedTracks.map((track, position) => ({
              trackId: track.id,
              addedById: playlist.userId,
              position,
              addedAt: faker.date.recent({ days: 120 }),
            })),
          },
        },
      })
      totalTracksAdded += selectedTracks.length
    }

    this.logger.log(`✅ Created ${playlists.length} playlists with ${totalTracksAdded} tracks`)
  }

  /**
   * Создаёт лайки пользователей
   */
  async createUserLikes() {
    this.logger.log('\n═══════════════════════════════════════')
    this.logger.log('❤️  STEP 6: Creating user libraries and activity')
    this.logger.log('═══════════════════════════════════════')

    const users = await this.prisma.user.findMany({ select: { id: true } })
    const tracks = await this.prisma.track.findMany({ select: { id: true } })

    if (users.length === 0 || tracks.length === 0) {
      this.logger.log('⚠️ No users or tracks found.')
      return
    }

    const artists = await this.prisma.artist.findMany({ select: { id: true } })
    const albums = await this.prisma.album.findMany({ select: { id: true } })
    const playlists = await this.prisma.playlist.findMany({
      where: { isPublic: true },
      select: { id: true, userId: true },
    })

    const likedTracks = users.flatMap((user) =>
      this.sample(tracks, 5, 20).map((track) => ({
        userId: user.id,
        trackId: track.id,
        createdAt: faker.date.recent({ days: 180 }),
      })),
    )
    const likedAlbums = users.flatMap((user) =>
      this.sample(albums, 1, 5).map((album) => ({ userId: user.id, albumId: album.id })),
    )
    const followedArtists = users.flatMap((user) =>
      this.sample(artists, 1, 5).map((artist) => ({ userId: user.id, artistId: artist.id })),
    )
    const likedPlaylists = users.flatMap((user) =>
      this.sample(
        playlists.filter((playlist) => playlist.userId !== user.id),
        1,
        5,
      ).map((playlist) => ({ userId: user.id, playlistId: playlist.id })),
    )
    const history = users.flatMap((user) =>
      this.sample(tracks, 8, 24).map((track) => ({
        userId: user.id,
        trackId: track.id,
        listenedAt: faker.date.recent({ days: 60 }),
      })),
    )

    await this.prisma.userLikedTrack.createMany({ data: likedTracks, skipDuplicates: true })
    await this.prisma.userLikedAlbum.createMany({ data: likedAlbums, skipDuplicates: true })
    await this.prisma.userLikedArtist.createMany({ data: followedArtists, skipDuplicates: true })
    await this.prisma.userFollowedArtist.createMany({
      data: followedArtists,
      skipDuplicates: true,
    })
    await this.prisma.userLikedPlaylist.createMany({ data: likedPlaylists, skipDuplicates: true })
    await this.prisma.listeningHistory.createMany({ data: history })
    await this.prisma.searchHistory.createMany({
      data: users.flatMap((user) =>
        faker.helpers.arrayElements(SEED_SEARCH_QUERIES, 3).map((query) => ({
          userId: user.id,
          query,
          searchedAt: faker.date.recent({ days: 30 }),
        })),
      ),
    })
    await this.prisma.notification.createMany({
      data: users.flatMap((user) => [
        {
          userId: user.id,
          type: 'NEW_RELEASE' as const,
          title: 'New music is waiting for you',
          body: 'Open your release feed to discover recently added tracks.',
        },
        {
          userId: user.id,
          type: 'SYSTEM' as const,
          title: 'Welcome to Spotify Clone',
          readAt: faker.datatype.boolean() ? new Date() : null,
        },
      ]),
    })

    this.logger.log(
      `✅ Created ${likedTracks.length} track likes and ${history.length} history entries`,
    )
  }

  /** Creates podcasts, episodes and saved episode relations for library screens. */
  async createPodcasts() {
    this.logger.log('\n═══════════════════════════════════════')
    this.logger.log('🎙️  STEP 7: Creating podcasts and episodes')
    this.logger.log('═══════════════════════════════════════')

    const tracks = await this.prisma.track.findMany({
      where: { deletedAt: null },
      select: { audioUrl: true, cover: true, duration: true },
      take: 24,
    })
    if (tracks.length === 0) {
      this.logger.warn('⚠️ No tracks available for demo episode audio')
      return
    }

    const episodeIds: string[] = []
    for (const [podcastIndex, podcast] of SEED_PODCASTS.entries()) {
      const createdPodcast = await this.prisma.podcast.create({
        data: {
          ...podcast,
          cover:
            tracks[podcastIndex % tracks.length]?.cover ??
            faker.image.url({ width: 800, height: 800 }),
          episodes: {
            create: Array.from({ length: 4 }, (_, episodeIndex) => {
              const source = tracks[(podcastIndex * 4 + episodeIndex) % tracks.length]!
              return {
                title: `${podcast.title}: Episode ${episodeIndex + 1}`,
                description: faker.lorem.paragraph(),
                audioUrl: source.audioUrl,
                cover: source.cover,
                duration: source.duration,
                releaseDate: faker.date.recent({ days: 120 }),
              }
            }),
          },
        },
        include: { episodes: { select: { id: true } } },
      })
      episodeIds.push(...createdPodcast.episodes.map((episode) => episode.id))
    }

    const users = await this.prisma.user.findMany({ select: { id: true } })
    await this.prisma.userSavedEpisode.createMany({
      data: users.flatMap((user) =>
        this.sample(episodeIds, 1, 3).map((episodeId) => ({ userId: user.id, episodeId })),
      ),
      skipDuplicates: true,
    })
    this.logger.log(`✅ Created ${SEED_PODCASTS.length} podcasts and ${episodeIds.length} episodes`)
  }

  /**
   * Очищает базу данных
   */
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
