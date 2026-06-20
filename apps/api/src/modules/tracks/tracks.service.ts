import { createReadStream, promises as fs } from 'node:fs'
import { extname } from 'node:path'
import type { AppConfig } from '@common/config'
import { PrismaService } from '@infra/prisma/prisma.service'
import type { ArtistEntity } from '@modules/artists'
import type { UserEntity } from '@modules/users'
import { InjectQueue } from '@nestjs/bullmq'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Artist } from '@prisma/client'
import type { Queue } from 'bullmq'
import { parseFile } from 'music-metadata'
import type { CreateTrackDto } from './dtos'
import type { TrackEntity } from './entities'

const TARGET_AUDIO_BITRATES = [128, 192, 320] as const

@Injectable()
export class TracksService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('audio-processing') private readonly audioQueue: Queue,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  private readonly logger = new Logger(TracksService.name, { timestamp: true })

  private async enqueueAudioConversion({
    trackId,
    artistId,
    sourceFileName,
    inputPath,
    bitrates,
  }: {
    trackId: string
    artistId: string
    sourceFileName: string
    inputPath: string
    bitrates: string[]
  }) {
    try {
      await this.audioQueue.add(
        'convert-audio',
        {
          trackId,
          artistId,
          sourceFileName,
          inputPath,
          outputDir: this.configService.getOrThrow('storage').getTracksDir(),
          format: 'opus',
          bitrates,
        },
        {
          jobId: `convert-audio-${trackId}-${sourceFileName}`,
          attempts: 5,
          backoff: { type: 'exponential', delay: 5_000 },
          removeOnComplete: { age: 3_600, count: 1_000 },
          removeOnFail: { age: 604_800, count: 5_000 },
        },
      )
    } catch (error) {
      await this.prisma.track.update({
        where: { id: trackId },
        data: {
          processingStatus: 'FAILED',
          processingError: error instanceof Error ? error.message : 'Unable to enqueue conversion',
          processingFinishedAt: new Date(),
        },
      })
      throw error
    }
  }

  private async inspectAudioFile(filePath: string) {
    try {
      const metadata = await parseFile(filePath)
      const bitrate = metadata.format.bitrate
        ? Math.max(1, Math.round(metadata.format.bitrate / 1000))
        : 0
      const duration = metadata.format.duration
        ? Math.max(1, Math.round(metadata.format.duration))
        : null

      return {
        bitrate,
        duration,
        codec: metadata.format.codec ?? null,
        container: metadata.format.container?.toLowerCase() ?? null,
      }
    } catch (error) {
      this.logger.warn(
        `Unable to inspect audio metadata: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      )
      return { bitrate: 0, duration: null, codec: null, container: null }
    }
  }

  private getTargetBitrates(sourceBitrate: number) {
    if (sourceBitrate <= 0) {
      return TARGET_AUDIO_BITRATES.map((bitrate) => `${bitrate}k`)
    }

    const bitrates = TARGET_AUDIO_BITRATES.filter((bitrate) => bitrate <= sourceBitrate)
    if (bitrates.length > 0) {
      return bitrates.map((bitrate) => `${bitrate}k`)
    }

    return [`${sourceBitrate}k`]
  }

  private getContentType(fileName: string) {
    const extension = extname(fileName).replace('.', '').toLowerCase()
    switch (extension) {
      case 'mp3':
        return 'audio/mpeg'
      case 'ogg':
        return 'audio/ogg'
      case 'opus':
        return 'audio/ogg'
      case 'wav':
        return 'audio/wav'
      case 'webm':
        return 'audio/webm'
      default:
        return 'application/octet-stream'
    }
  }

  async findAll({
    page = 1,
    limit = 10,
    title,
  }: { page?: number; limit?: number } & Partial<TrackEntity>) {
    const skip = (page - 1) * limit

    const [data, total] = await this.prisma.$transaction([
      this.prisma.track.findMany({
        skip,
        where: title
          ? {
              title: {
                contains: title,
                mode: 'insensitive',
              },
            }
          : undefined,
        take: limit,
      }),
      this.prisma.track.count(),
    ])

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    }
  }

  async like(userId: UserEntity['id'], trackId: TrackEntity['id']) {
    return await this.prisma.track.update({
      where: { id: trackId },
      data: { likedBy: { connect: { id: userId } } },
    })
  }

  async unlike(userId: UserEntity['id'], trackId: TrackEntity['id']) {
    return await this.prisma.track.update({
      where: { id: trackId },
      data: { likedBy: { disconnect: { id: userId } } },
    })
  }

  async findLikedTracks(
    userId: UserEntity['id'],
    { page = 1, limit = 10 }: { page?: number; limit?: number },
  ) {
    return await this.prisma.track.findMany({
      where: {
        likedBy: {
          some: {
            id: userId,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    })
  }

  async findTrackById(id: TrackEntity['id']) {
    return await this.prisma.track.findUnique({
      where: {
        id,
      },
    })
  }

  private async selectTrackFile(
    id: TrackEntity['id'],
    preferredBitrate?: number,
    preferredFormat = 'opus',
  ) {
    const track = await this.prisma.track.findUnique({ where: { id } })
    if (!track) throw new NotFoundException('Track not found')

    const audioFiles = await this.prisma.trackFile.findMany({
      where: { trackId: id },
      orderBy: { bitrate: 'asc' },
    })
    if (audioFiles.length === 0) throw new NotFoundException('Audio file not found')

    const preferredFiles = audioFiles.filter(
      (file) => file.format === preferredFormat && file.bitrate > 0,
    )
    const candidates =
      preferredFiles.length > 0 ? preferredFiles : audioFiles.filter((file) => file.bitrate > 0)
    const availableFiles = candidates.length > 0 ? candidates : audioFiles
    const selectedFile = preferredBitrate
      ? ([...availableFiles].reverse().find((file) => file.bitrate <= preferredBitrate) ??
        availableFiles[0])
      : availableFiles.at(-1)

    if (!selectedFile) throw new NotFoundException('Audio file not found')
    return selectedFile
  }

  async getTrackAudioStream(
    id: TrackEntity['id'],
    preferredBitrate?: number,
    preferredFormat = 'opus',
  ) {
    const selectedFile = await this.selectTrackFile(id, preferredBitrate, preferredFormat)
    const filePath = this.configService.getOrThrow('storage').getTracksDir(selectedFile.url)

    try {
      const fileStat = await fs.stat(filePath)
      return {
        stream: createReadStream(filePath),
        trackId: id,
        bitrate: selectedFile.bitrate,
        format: selectedFile.format,
        codec: selectedFile.codec,
        contentType: this.getContentType(selectedFile.url),
        size: fileStat.size,
      }
    } catch {
      throw new NotFoundException('Audio file not found')
    }
  }

  async getTrackStream(
    id: TrackEntity['id'],
    range?: string,
    preferredBitrate?: number,
    preferredFormat = 'opus',
  ) {
    const selectedFile = await this.selectTrackFile(id, preferredBitrate, preferredFormat)
    const filePath = this.configService.getOrThrow('storage').getTracksDir(selectedFile.url)

    let stat: Awaited<ReturnType<typeof fs.stat>>
    try {
      stat = await fs.stat(filePath)
    } catch {
      throw new NotFoundException('Audio file not found')
    }

    const fileSize = stat.size
    let start = 0
    let end = fileSize - 1

    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range)
      if (!(match && (match[1] || match[2]))) {
        throw new BadRequestException('Invalid Range header')
      }

      if (match[1]) {
        start = Number.parseInt(match[1], 10)
      } else {
        const suffixLength = Number.parseInt(match[2] ?? '', 10)
        if (!Number.isFinite(suffixLength) || suffixLength <= 0) {
          throw new BadRequestException('Invalid Range header')
        }
        start = Math.max(0, fileSize - suffixLength)
      }

      end = match[1] && match[2] ? Number.parseInt(match[2], 10) : fileSize - 1
      end = Math.min(end, fileSize - 1)

      if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= fileSize) {
        throw new BadRequestException('Invalid Range header')
      }
    }

    return {
      stream: createReadStream(filePath, { start, end }),
      contentType: this.getContentType(selectedFile.url),
      contentLength: end - start + 1,
      fileSize,
      start,
      end,
      isPartial: Boolean(range),
      bitrate: selectedFile.bitrate,
      format: selectedFile.format,
    }
  }

  async getHlsMasterPlaylist(id: TrackEntity['id']) {
    const track = await this.prisma.track.findUnique({ where: { id } })
    if (!track) throw new NotFoundException('Track not found')

    const files = await this.prisma.trackFile.findMany({
      where: { trackId: id, format: 'opus', bitrate: { gt: 0 } },
      orderBy: { bitrate: 'asc' },
    })

    const variants: number[] = []
    for (const file of files) {
      const playlistPath = this.configService
        .getOrThrow('storage')
        .getTracksDir(`${file.url}.hls/index.m3u8`)
      try {
        await fs.access(playlistPath)
        variants.push(file.bitrate)
      } catch {
        // Conversion may still be running; omit incomplete variants.
      }
    }

    if (variants.length === 0) {
      throw new NotFoundException('HLS stream is not ready')
    }

    const lines = ['#EXTM3U', '#EXT-X-VERSION:7', '#EXT-X-INDEPENDENT-SEGMENTS']
    for (const bitrate of variants) {
      lines.push(
        `#EXT-X-STREAM-INF:BANDWIDTH=${bitrate * 1000},AVERAGE-BANDWIDTH=${bitrate * 1000},CODECS="mp4a.40.2"`,
        `${bitrate}/index.m3u8`,
      )
    }

    return `${lines.join('\n')}\n`
  }

  async getHlsAsset(id: TrackEntity['id'], bitrate: number, asset: string) {
    if (!/^(index\.m3u8|init\.mp4|segment_\d{5}\.m4s)$/.test(asset)) {
      throw new NotFoundException('HLS asset not found')
    }

    const file = await this.prisma.trackFile.findUnique({
      where: {
        trackId_format_bitrate: { trackId: id, format: 'opus', bitrate },
      },
    })
    if (!file) throw new NotFoundException('HLS quality not found')

    const assetPath = this.configService
      .getOrThrow('storage')
      .getTracksDir(`${file.url}.hls/${asset}`)

    try {
      const stat = await fs.stat(assetPath)
      const contentType = asset.endsWith('.m3u8')
        ? 'application/vnd.apple.mpegurl'
        : asset.endsWith('.mp4')
          ? 'video/mp4'
          : 'video/iso.segment'

      return {
        stream: createReadStream(assetPath),
        contentType,
        contentLength: stat.size,
        immutable: !asset.endsWith('.m3u8'),
      }
    } catch {
      throw new NotFoundException('HLS asset not found')
    }
  }

  async findTracksByArtistId(artistId: Artist['id']) {
    return await this.prisma.track.findMany({
      where: {
        artistId,
      },
    })
  }

  async findTracksByArtistName(artistUsername: Artist['username']) {
    return await this.prisma.track.findMany({
      where: {
        artist: {
          username: artistUsername,
        },
      },
    })
  }

  async create(
    artistId: ArtistEntity['id'],
    createTrackDto: CreateTrackDto,
    audioFile: Express.Multer.File,
    coverFile?: Express.Multer.File,
  ) {
    const inputPath = this.configService.getOrThrow('storage').getTracksDir(audioFile.filename)
    const metadata = await this.inspectAudioFile(inputPath)
    const formatFromMime: Record<string, { format: string; codec?: string | null }> = {
      'audio/mpeg': { format: 'mp3', codec: 'mp3' },
      'audio/ogg': { format: 'ogg', codec: null },
      'audio/wav': { format: 'wav', codec: null },
      'audio/webm': { format: 'webm', codec: null },
    }

    const extension = extname(audioFile.originalname).replace('.', '').toLowerCase()
    const fromMime = formatFromMime[audioFile.mimetype]
    const format = metadata.container ?? fromMime?.format ?? (extension || 'unknown')
    const codec = metadata.codec ?? fromMime?.codec ?? null

    const track = await this.prisma.$transaction(async (tx) => {
      const created = await tx.track.create({
        data: {
          artistId,
          title: createTrackDto.title,
          audioUrl: audioFile.filename,
          cover: coverFile?.filename ?? null,
          duration: metadata.duration,
          processingStatus: 'PROCESSING',
          processingError: null,
          processingAttempts: 0,
          processingStartedAt: null,
          processingFinishedAt: null,
        },
      })

      await tx.trackFile.create({
        data: {
          trackId: created.id,
          format,
          bitrate: metadata.bitrate,
          codec,
          url: audioFile.filename,
          size: audioFile.size,
        },
      })

      return created
    })

    await this.enqueueAudioConversion({
      trackId: track.id,
      artistId,
      sourceFileName: audioFile.filename,
      inputPath,
      bitrates: this.getTargetBitrates(metadata.bitrate),
    })

    this.logger.log(`Queued audio conversion for track ID: ${track.id} added`)

    return track
  }

  async update(
    id: TrackEntity['id'],
    createTrackDto: CreateTrackDto,
    audioFile?: Express.Multer.File,
    coverFile?: Express.Multer.File,
  ) {
    const inputPath = audioFile
      ? this.configService.getOrThrow('storage').getTracksDir(audioFile.filename)
      : null
    const metadata = inputPath ? await this.inspectAudioFile(inputPath) : null
    const formatFromMime: Record<string, { format: string; codec?: string | null }> = {
      'audio/mpeg': { format: 'mp3', codec: 'mp3' },
      'audio/ogg': { format: 'ogg', codec: null },
      'audio/wav': { format: 'wav', codec: null },
      'audio/webm': { format: 'webm', codec: null },
    }

    const extension = audioFile?.originalname
      ? extname(audioFile.originalname).replace('.', '').toLowerCase()
      : ''
    const fromMime = audioFile ? formatFromMime[audioFile.mimetype] : undefined
    const format = audioFile
      ? (metadata?.container ?? fromMime?.format ?? (extension || 'unknown'))
      : undefined
    const codec = audioFile ? (metadata?.codec ?? fromMime?.codec ?? null) : undefined

    const track = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.track.update({
        where: {
          id,
        },
        data: {
          title: createTrackDto.title,
          cover: coverFile?.filename ?? undefined,
          audioUrl: audioFile?.filename ?? undefined,
          duration: metadata?.duration ?? undefined,
          processingStatus: audioFile ? 'PROCESSING' : undefined,
          processingError: audioFile ? null : undefined,
          processingAttempts: audioFile ? 0 : undefined,
          processingStartedAt: audioFile ? null : undefined,
          processingFinishedAt: audioFile ? null : undefined,
        },
      })

      if (audioFile && format) {
        await tx.trackFile.upsert({
          where: {
            trackId_format_bitrate: {
              trackId: updated.id,
              format,
              bitrate: metadata?.bitrate ?? 0,
            },
          },
          update: {
            codec,
            url: audioFile.filename,
            size: audioFile.size,
          },
          create: {
            trackId: updated.id,
            format,
            bitrate: metadata?.bitrate ?? 0,
            codec,
            url: audioFile.filename,
            size: audioFile.size,
          },
        })
      }

      return updated
    })

    if (audioFile && inputPath && metadata) {
      await this.enqueueAudioConversion({
        trackId: track.id,
        artistId: track.artistId,
        sourceFileName: audioFile.filename,
        inputPath,
        bitrates: this.getTargetBitrates(metadata.bitrate),
      })
    }

    return track
  }
}
