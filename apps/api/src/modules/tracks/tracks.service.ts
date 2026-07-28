import { extname } from 'node:path'
import { text } from 'node:stream/consumers'
import type { AppConfig } from '@common/config'
import { isPrismaP2025 } from '@common/utils/prisma'
import { NS, TTL } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import type { ArtistEntity } from '@modules/artists'
import type { UserEntity } from '@modules/users'
import { InjectQueue } from '@nestjs/bullmq'
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Artist } from '@prisma/client'
import type { Queue } from 'bullmq'
import { parseFile } from 'music-metadata'
import type { CreateTrackDto } from './dtos'
import type { TrackEntity } from './entities'

/** Supported output bitrates for transcoding (kbps). */
const TARGET_AUDIO_BITRATES = [128, 192, 320] as const

/**
 * Storage key helpers — single source of truth for all path derivations.
 * TrackFile.url stores: tracks/{trackId}/audio/{bitrate}k.opus
 */
const storageKey = {
  hlsMaster: (trackId: string) => `tracks/${trackId}/hls/master.m3u8`,
  hlsAsset: (trackId: string, bitrate: number, asset: string) =>
    `tracks/${trackId}/hls/${bitrate}/${asset}`,
}

/** Handles track CRUD, audio streaming, and queuing of audio-conversion jobs. */
@Injectable()
export class TracksService {
  /** Creates a new instance. */
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('audio-processing') private readonly audioQueue: Queue,
    private readonly configService: ConfigService<AppConfig>,
    private readonly cache: CacheService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  /** The logger value. */
  private readonly logger = new Logger(TracksService.name, { timestamp: true })

  /**
   * Adds an audio-conversion job to the BullMQ queue and marks the track FAILED on enqueue error.
   */
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

  /** Reads audio metadata from the file at `filePath`. */
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

  /** Returns the list of target bitrate strings derived from the source bitrate. */
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

  /** Returns a MIME type for a given filename extension. */
  private getContentType(fileName: string) {
    const extension = extname(fileName).replace('.', '').toLowerCase()
    switch (extension) {
      case 'mp3':
        return 'audio/mpeg'
      case 'ogg':
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

  /** Resolves and validates a TrackFile, throwing NotFoundException on missing/unavailable tracks. */
  private async selectTrackFile(
    id: TrackEntity['id'],
    preferredBitrate?: number,
    preferredFormat = 'opus',
  ) {
    const track = await this.prisma.track.findUnique({ where: { id } })
    if (!track) throw new NotFoundException('Track not found')
    if (track.processingStatus !== 'READY')
      throw new NotFoundException('Track is not available yet')

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

  // ────────────────────────────────────────────────────────────
  // Public streaming methods
  // ────────────────────────────────────────────────────────────

  /** Returns a progressive storage stream for the legacy WebSocket audio transport. */
  async getTrackAudioStream(
    id: TrackEntity['id'],
    preferredBitrate?: number,
    preferredFormat = 'opus',
  ) {
    const selectedFile = await this.selectTrackFile(id, preferredBitrate, preferredFormat)
    const { stream, contentLength, contentType } = await this.storage.getObjectStream(
      selectedFile.url,
    )

    return {
      stream,
      trackId: id,
      bitrate: selectedFile.bitrate,
      format: selectedFile.format,
      codec: selectedFile.codec,
      contentType: contentType ?? this.getContentType(selectedFile.url),
      size: contentLength ?? selectedFile.size,
    }
  }

  /**
   * Streams a progressive audio file from storage with HTTP Range support.
   * Returns a presigned redirect URL for the full file, or proxies a range request.
   */
  async getTrackStream(
    id: TrackEntity['id'],
    range?: string,
    preferredBitrate?: number,
    preferredFormat = 'opus',
  ) {
    const selectedFile = await this.selectTrackFile(id, preferredBitrate, preferredFormat)
    const { stream, contentLength, contentType } = await this.storage.getObjectStream(
      selectedFile.url,
    )

    const mimeType = contentType ?? this.getContentType(selectedFile.url)

    if (!range) {
      return {
        stream,
        contentType: mimeType,
        contentLength: contentLength ?? 0,
        fileSize: contentLength ?? 0,
        start: 0,
        end: (contentLength ?? 1) - 1,
        isPartial: false,
        bitrate: selectedFile.bitrate,
        format: selectedFile.format,
      }
    }

    // For range requests, fetch the full object and return with range metadata.
    // Both storage drivers support byte-range natively — re-fetch with Range header.
    const match = /^bytes=(\d*)-(\d*)$/.exec(range)
    if (!(match && (match[1] || match[2]))) {
      throw new BadRequestException('Invalid Range header')
    }

    const fileSize = contentLength ?? 0
    let start = match[1] ? Number.parseInt(match[1], 10) : 0
    let end = match[1] && match[2] ? Number.parseInt(match[2], 10) : fileSize - 1

    if (!match[1] && match[2]) {
      const suffixLength = Number.parseInt(match[2], 10)
      start = Math.max(0, fileSize - suffixLength)
      end = fileSize - 1
    }

    end = Math.min(end, fileSize - 1)

    if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= fileSize) {
      throw new BadRequestException('Invalid Range header')
    }

    const ranged = await this.storage.getObjectStream(selectedFile.url, `bytes=${start}-${end}`)
    return {
      stream: ranged.stream,
      contentType: mimeType,
      contentLength: end - start + 1,
      fileSize,
      start,
      end,
      isPartial: true,
      bitrate: selectedFile.bitrate,
      format: selectedFile.format,
    }
  }

  /** Returns a presigned storage URL for direct progressive audio download (no proxy). */
  async getTrackStreamUrl(
    id: TrackEntity['id'],
    preferredBitrate?: number,
    preferredFormat = 'opus',
  ) {
    const selectedFile = await this.selectTrackFile(id, preferredBitrate, preferredFormat)
    return this.storage.getPresignedUrl(selectedFile.url, 3_600)
  }

  /** Returns the FFmpeg-generated HLS master playlist from storage. */
  async getHlsMasterPlaylist(id: TrackEntity['id']) {
    const track = await this.prisma.track.findUnique({ where: { id } })
    if (!track) throw new NotFoundException('Track not found')
    if (track.processingStatus !== 'READY') {
      throw new NotFoundException('HLS stream is not ready')
    }

    try {
      const { stream } = await this.storage.getObjectStream(storageKey.hlsMaster(id))
      return await text(stream)
    } catch {
      throw new NotFoundException('HLS stream is not ready')
    }
  }

  /** Proxies an HLS asset (playlist or segment) from storage. */
  async getHlsAsset(id: TrackEntity['id'], bitrate: number, asset: string) {
    if (!/^(index\.m3u8|init_\d+\.mp4|segment_\d{5}\.m4s)$/.test(asset)) {
      throw new NotFoundException('HLS asset not found')
    }

    const file = await this.prisma.trackFile.findUnique({
      where: { trackId_format_bitrate: { trackId: id, format: 'opus', bitrate } },
    })
    if (!file) throw new NotFoundException('HLS quality not found')

    const key = storageKey.hlsAsset(id, bitrate, asset)

    try {
      const { stream, contentLength } = await this.storage.getObjectStream(key)
      const contentType = asset.endsWith('.m3u8')
        ? 'application/vnd.apple.mpegurl'
        : asset.endsWith('.mp4')
          ? 'video/mp4'
          : 'video/iso.segment'

      return { stream, contentType, contentLength, immutable: !asset.endsWith('.m3u8') }
    } catch {
      throw new NotFoundException('HLS asset not found')
    }
  }

  // ────────────────────────────────────────────────────────────
  // Track CRUD
  // ────────────────────────────────────────────────────────────

  /** Runs the find all operation. */
  async findAll({
    page = 1,
    limit = 10,
    title,
  }: { page?: number; limit?: number } & Partial<TrackEntity>) {
    const safeLimit = Math.min(limit, 100)
    return await this.cache.wrap(
      NS.TRACKS,
      `list:${page}:${safeLimit}:${title ?? ''}`,
      TTL.SHORT,
      async () => {
        const skip = (page - 1) * safeLimit
        const [data, total] = await this.prisma.$transaction([
          this.prisma.track.findMany({
            skip,
            where: {
              processingStatus: 'READY',
              ...(title ? { title: { contains: title, mode: 'insensitive' } } : {}),
            },
            take: safeLimit,
          }),
          this.prisma.track.count({
            where: {
              processingStatus: 'READY',
              ...(title ? { title: { contains: title, mode: 'insensitive' } } : {}),
            },
          }),
        ])
        return {
          data,
          meta: { total, page, limit: safeLimit, lastPage: Math.ceil(total / safeLimit) },
        }
      },
    )
  }

  /** Runs the like operation. */
  async like(userId: UserEntity['id'], trackId: TrackEntity['id']) {
    try {
      return await this.prisma.track.update({
        where: { id: trackId },
        data: { likedBy: { connect: { id: userId } } },
      })
    } catch (error: unknown) {
      if (isPrismaP2025(error)) throw new NotFoundException('Track not found')
      throw error
    }
  }

  /** Runs the unlike operation. */
  async unlike(userId: UserEntity['id'], trackId: TrackEntity['id']) {
    try {
      return await this.prisma.track.update({
        where: { id: trackId },
        data: { likedBy: { disconnect: { id: userId } } },
      })
    } catch (error: unknown) {
      if (isPrismaP2025(error)) throw new NotFoundException('Track not found')
      throw error
    }
  }

  /** Runs the find liked tracks operation. */
  async findLikedTracks(
    userId: UserEntity['id'],
    { page = 1, limit = 10 }: { page?: number; limit?: number },
  ) {
    const safeLimit = Math.min(limit, 100)
    return await this.prisma.track.findMany({
      where: {
        processingStatus: 'READY',
        likedBy: { some: { id: userId } },
      },
      skip: (page - 1) * safeLimit,
      take: safeLimit,
    })
  }

  /** Runs the find track by id operation. */
  async findTrackById(id: TrackEntity['id']) {
    return await this.cache.wrap(NS.TRACKS, `id:${id}`, TTL.LONG, () =>
      this.prisma.track.findFirst({ where: { id, processingStatus: 'READY' } }),
    )
  }

  /** Runs the find tracks by artist id operation. */
  async findTracksByArtistId(artistId: Artist['id']) {
    return await this.cache.wrap(NS.TRACKS, `artist:${artistId}`, TTL.SHORT, () =>
      this.prisma.track.findMany({ where: { artistId, processingStatus: 'READY' } }),
    )
  }

  /** Runs the find tracks by artist name operation. */
  async findTracksByArtistName(artistUsername: Artist['username']) {
    return await this.prisma.track.findMany({
      where: { processingStatus: 'READY', artist: { username: artistUsername } },
    })
  }

  /** Runs the create operation. */
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

    this.logger.log(`Queued audio conversion for track ID: ${track.id}`)
    await Promise.all([this.cache.invalidate(NS.TRACKS), this.cache.invalidate(NS.SEARCH)])

    return track
  }

  /** Runs the update operation. */
  async update(
    artistId: ArtistEntity['id'],
    id: TrackEntity['id'],
    createTrackDto: CreateTrackDto,
    audioFile?: Express.Multer.File,
    coverFile?: Express.Multer.File,
  ) {
    const existingTrack = await this.prisma.track.findFirst({ where: { id, artistId } })
    if (!existingTrack) throw new NotFoundException('Track not found or does not belong to artist')

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
        where: { id },
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
          update: { codec, url: audioFile.filename, size: audioFile.size },
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

    await Promise.all([this.cache.invalidate(NS.TRACKS), this.cache.invalidate(NS.SEARCH)])

    return track
  }
}
