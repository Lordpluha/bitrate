import { createReadStream, promises as fs } from 'node:fs'
import type { AppConfig } from '@common/config'
import { PrismaService } from '@infra/prisma/prisma.service'
import { ArtistEntity } from '@modules/artists'
import { UserEntity } from '@modules/users'
import { InjectQueue } from '@nestjs/bullmq'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Artist } from '@prisma/client'
import { Queue } from 'bullmq'
import { parseFile } from 'music-metadata'
import { extname } from 'path'
import { CreateTrackDto } from './dtos'
import { TrackEntity } from './entities'

@Injectable()
export class TracksService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('audio-processing') private readonly audioQueue: Queue,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  private readonly logger = new Logger(TracksService.name, { timestamp: true })

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

  private async getMaxBytesForTenSeconds(filePath: string, fileSize: number) {
    const metadata = await parseFile(filePath)
    const duration = metadata.format.duration
    const bitrate = metadata.format.bitrate

    if (bitrate && bitrate > 0) {
      return Math.max(1, Math.floor((bitrate / 8) * 10))
    }

    if (duration && duration > 0) {
      return Math.max(1, Math.floor((fileSize / duration) * 10))
    }

    throw new BadRequestException('Unable to determine track duration')
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

  async findLikedTracksByUserId(userId: UserEntity['id']) {
    return await this.prisma.track.findMany({
      where: {
        likedBy: {
          some: {
            id: userId,
          },
        },
      },
    })
  }

  async findTrackById(id: TrackEntity['id']) {
    return await this.prisma.track.findUnique({
      where: {
        id,
      },
    })
  }

  async getTrackStream(id: TrackEntity['id'], range?: string) {
    const track = await this.prisma.track.findUnique({
      where: {
        id,
      },
    })

    if (!track) {
      throw new NotFoundException('Track not found')
    }

    const filePath = this.configService.getOrThrow('storage').getTracksDir(track.audioUrl)

    let stat
    try {
      stat = await fs.stat(filePath)
    } catch {
      throw new NotFoundException('Audio file not found')
    }

    const fileSize = stat.size
    const contentType = this.getContentType(track.audioUrl)
    const maxBytes = await this.getMaxBytesForTenSeconds(filePath, fileSize)

    let start = 0
    let end = Math.min(fileSize - 1, maxBytes - 1)

    if (range) {
      const match = /bytes=(\d*)-(\d*)/.exec(range)
      if (!match) {
        throw new BadRequestException('Invalid Range header')
      }

      start = match[1] ? Number.parseInt(match[1], 10) : 0
      end = match[2] ? Number.parseInt(match[2], 10) : fileSize - 1

      if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= fileSize) {
        throw new BadRequestException('Invalid Range header')
      }

      const maxEnd = Math.min(fileSize - 1, start + maxBytes - 1)
      end = Math.min(end, maxEnd)
    }

    const stream = createReadStream(filePath, { start, end })
    const contentLength = end - start + 1
    const isPartial = start !== 0 || end !== fileSize - 1

    return {
      stream,
      contentType,
      contentLength,
      fileSize,
      start,
      end,
      isPartial,
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
    const formatFromMime: Record<string, { format: string; codec?: string | null }> = {
      'audio/mpeg': { format: 'mp3', codec: 'mp3' },
      'audio/ogg': { format: 'ogg', codec: null },
      'audio/wav': { format: 'wav', codec: null },
      'audio/webm': { format: 'webm', codec: null },
    }

    const extension = extname(audioFile.originalname).replace('.', '').toLowerCase()
    const fromMime = formatFromMime[audioFile.mimetype]
    const format = fromMime?.format ?? (extension || 'unknown')
    const codec = fromMime?.codec ?? null

    const track = await this.prisma.$transaction(async (tx) => {
      const created = await tx.track.create({
        data: {
          artistId,
          title: createTrackDto.title,
          audioUrl: audioFile.filename,
          cover: coverFile?.filename ?? null,
        },
      })

      await tx.trackFile.create({
        data: {
          trackId: created.id,
          format,
          bitrate: 0,
          codec,
          url: audioFile.filename,
          size: audioFile.size,
        },
      })

      return created
    })

    await this.audioQueue.add('convert-audio', {
      trackId: track.id,
      artistId,
      inputPath: this.configService.getOrThrow('storage').getTracksDir(audioFile.filename),
      outputDir: this.configService.getOrThrow('storage').getTracksDir(),
      format: 'opus',
      bitrates: ['128k', '192k', '320k'],
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
    const format = audioFile ? (fromMime?.format ?? (extension || 'unknown')) : undefined
    const codec = audioFile ? (fromMime?.codec ?? null) : undefined

    const track = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.track.update({
        where: {
          id,
        },
        data: {
          title: createTrackDto.title,
          cover: coverFile?.filename ?? undefined,
          audioUrl: audioFile?.filename ?? undefined,
        },
      })

      if (audioFile && format) {
        await tx.trackFile.upsert({
          where: {
            trackId_format_bitrate: {
              trackId: updated.id,
              format,
              bitrate: 0,
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
            bitrate: 0,
            codec,
            url: audioFile.filename,
            size: audioFile.size,
          },
        })
      }

      return updated
    })

    if (audioFile) {
      await this.audioQueue.add('convert-audio', {
        trackId: track.id,
        artistId: track.artistId,
        inputPath: this.configService.getOrThrow('storage').getTracksDir(audioFile.filename),
        outputDir: this.configService.getOrThrow('storage').getTracksDir(),
        format: 'opus',
        bitrates: ['128k', '192k', '320k'],
      })
    }

    return track
  }
}
