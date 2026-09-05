import type { Artist as NCSArtist, Song as NCSSong } from '@bitrate/ncs-parser'
import * as ncs from '@bitrate/ncs-parser'
import { faker } from '@faker-js/faker'
import { Logger } from '@nestjs/common'
import type { PrismaClient } from '@prisma/client'
import config from '../config'
import type { DownloadResourcesService } from '../download-resources.service'
import { createMulterFileFromPath } from '../file-helper'
import { sanitizeUsername } from './seed.helpers'
import type { ITrackUploadService, NcsImportStats } from './seed.types'

/** Imports NoCopyrightSounds artists and their tracks into the database. */
export class NcsImportSeeder {
  /** Creates a new instance. */
  constructor(
    private readonly prisma: PrismaClient,
    private readonly downloadService: DownloadResourcesService,
    private readonly trackUploadService: ITrackUploadService,
  ) {}

  /** The logger value. */
  private readonly logger = new Logger(NcsImportSeeder.name, { timestamp: true })

  /** Создаёт или находит артиста в БД. */
  private async upsertArtist(ncsArtist: NCSArtist) {
    const username = sanitizeUsername(ncsArtist.name)

    return await this.prisma.artist.upsert({
      where: { username },
      update: {},
      create: {
        username,
        email: `${username}@ncs-import.local`,
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

  /** Marks an artist as the track's primary credit. */
  private async ensurePrimaryArtistCredit(trackId: string, artistId: string) {
    await this.prisma.trackArtist.upsert({
      where: { trackId_artistId: { trackId, artistId } },
      update: { isPrimary: true, position: 0 },
      create: { trackId, artistId, isPrimary: true, position: 0 },
    })
  }

  /**
   * Uploads one audio file as a track and attaches its release metadata.
   *
   * `duration` is deliberately untouched: the upload service already wrote the
   * real length read from the file, and an override here would replace it.
   */
  private async uploadTrack(
    artistId: string,
    title: string,
    audioPath: string,
    releaseDate: Date | null,
    coverFile?: Express.Multer.File,
  ) {
    const track = await this.trackUploadService.create(
      artistId,
      { title },
      createMulterFileFromPath(audioPath, 'audio'),
      coverFile,
    )

    await this.prisma.track.update({ where: { id: track.id }, data: { releaseDate } })
    await this.ensurePrimaryArtistCredit(track.id, artistId)
    return track
  }

  /** Создаёт трек и ставит задачу конвертации в очередь. */
  private async createTrack(ncsSong: NCSSong, artistId: string) {
    const existingTrack = await this.prisma.track.findFirst({
      where: { title: ncsSong.name, artistId },
    })
    if (existingTrack) {
      this.logger.log(`  ⏭️  Track "${ncsSong.name}" already exists, skipping...`)
      return existingTrack
    }

    const { audioFilePath, coverFilePath, instrumentalFilePath } =
      await this.downloadService.downloadTrackResources(ncsSong)
    if (!audioFilePath) throw new Error('No audio URL available for track')

    const coverFile = coverFilePath ? createMulterFileFromPath(coverFilePath, 'cover') : undefined
    const track = await this.uploadTrack(
      artistId,
      ncsSong.name,
      audioFilePath,
      ncsSong.date,
      coverFile,
    )

    if (instrumentalFilePath) {
      try {
        await this.uploadTrack(
          artistId,
          `${ncsSong.name} (Instrumental)`,
          instrumentalFilePath,
          ncsSong.date,
          coverFile,
        )
        this.logger.log('  🎹 Created instrumental version')
      } catch (error) {
        const reason = error instanceof Error ? error.message : error
        this.logger.warn(`  ⚠️  Failed to create instrumental version: ${reason}`)
      }
    }

    return track
  }

  /** Imports every song on one NCS page, reusing artists already seen. */
  private async importPage(songs: NCSSong[], artistCache: Map<string, string>) {
    let tracksImported = 0
    let artistsImported = 0

    for (const song of songs) {
      try {
        const primaryArtist = song.artists[0]
        if (!primaryArtist) {
          this.logger.warn(`  ⚠️  Skipping "${song.name}" - no artist information`)
          continue
        }

        let artistId = artistCache.get(primaryArtist.name)
        if (!artistId) {
          artistId = (await this.upsertArtist(primaryArtist)).id
          artistCache.set(primaryArtist.name, artistId)
          artistsImported++
          this.logger.log(`  👤 Created/found artist: ${primaryArtist.name}`)
        }

        await this.createTrack(song, artistId)
        tracksImported++
        this.logger.log(`  🎵 Imported track: ${song.name} by ${primaryArtist.name}`)
      } catch (error) {
        this.logger.error(
          `  ❌ Error processing song "${song.name}":`,
          error instanceof Error ? error.message : error,
        )
      }
    }

    return { tracksImported, artistsImported }
  }

  /** Импортирует артистов и треки из NCS. */
  async run(): Promise<NcsImportStats> {
    const pages = config.pagesToImport
    const artistCache = new Map<string, string>()
    let totalTracksImported = 0
    let totalArtistsImported = 0

    for (let page = 0; page < pages; page++) {
      this.logger.log(`\n📄 Processing NCS page ${page + 1}/${pages}...`)

      try {
        const songs = await ncs.search(config.filters, page)
        if (!songs || songs.length === 0) {
          this.logger.warn('  ⚠️  No songs found on this page, stopping...')
          break
        }

        this.logger.log(`  ✅ Found ${songs.length} songs`)
        const imported = await this.importPage(songs, artistCache)
        totalTracksImported += imported.tracksImported
        totalArtistsImported += imported.artistsImported

        if (page < pages - 1) {
          this.logger.log(`  ⏳ Waiting ${config.delayBetweenPages}ms before next page...`)
          await new Promise((resolve) => setTimeout(resolve, config.delayBetweenPages))
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
}
