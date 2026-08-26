import { text } from 'node:stream/consumers'
import { PrismaService } from '@infra/prisma/prisma.service'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { getHlsAssetKey, getHlsMasterKey } from './audio-storage-keys'
import type { TrackEntity } from './entities'
import {
  getContentType,
  getHlsAssetContentType,
  isAllowedHlsAsset,
  parseRangeHeader,
  selectPreferredTrackFile,
} from './track-audio.helpers'

/** Renditions are transcoded to Opus, so it is the format clients get unless they ask otherwise. */
const DEFAULT_AUDIO_FORMAT = 'opus'

/** Presigned progressive-download links stay valid for one hour. */
const PRESIGNED_URL_TTL_SECONDS = 3_600

/** Serves stored audio renditions over progressive, ranged, and HLS transports. */
@Injectable()
export class TrackStreamingService {
  /** Creates a new instance. */
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  /**
   * Resolves the stored rendition that best matches the requested quality.
   *
   * @throws NotFoundException when the track is missing, still processing, or has no audio.
   */
  private async selectTrackFile(
    id: TrackEntity['id'],
    preferredBitrate?: number,
    preferredFormat = DEFAULT_AUDIO_FORMAT,
  ) {
    const track = await this.prisma.track.findFirst({ where: { id, deletedAt: null } })
    if (!track) throw new NotFoundException('Track not found')
    if (track.processingStatus !== 'READY') {
      throw new NotFoundException('Track is not available yet')
    }

    const files = await this.prisma.trackFile.findMany({
      where: { trackId: id },
      orderBy: { bitrate: 'asc' },
    })
    if (files.length === 0) throw new NotFoundException('Audio file not found')

    const selectedFile = selectPreferredTrackFile({ files, preferredBitrate, preferredFormat })
    if (!selectedFile) throw new NotFoundException('Audio file not found')
    return selectedFile
  }

  /** Returns a progressive storage stream for the legacy WebSocket audio transport. */
  async getTrackAudioStream(
    id: TrackEntity['id'],
    preferredBitrate?: number,
    preferredFormat = DEFAULT_AUDIO_FORMAT,
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
      contentType: contentType ?? getContentType(selectedFile.url),
      size: contentLength ?? selectedFile.size,
    }
  }

  /**
   * Streams a progressive audio file from storage with HTTP Range support.
   *
   * Without a `Range` header the whole object is returned; with one the request is
   * re-issued against storage, since both drivers serve byte ranges natively.
   */
  async getTrackStream(
    id: TrackEntity['id'],
    range?: string,
    preferredBitrate?: number,
    preferredFormat = DEFAULT_AUDIO_FORMAT,
  ) {
    const selectedFile = await this.selectTrackFile(id, preferredBitrate, preferredFormat)
    const { stream, contentLength, contentType } = await this.storage.getObjectStream(
      selectedFile.url,
    )
    const mimeType = contentType ?? getContentType(selectedFile.url)

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

    const fileSize = contentLength ?? 0
    const { start, end } = parseRangeHeader(range, fileSize)
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
    preferredFormat = DEFAULT_AUDIO_FORMAT,
  ) {
    const selectedFile = await this.selectTrackFile(id, preferredBitrate, preferredFormat)
    return this.storage.getPresignedUrl(selectedFile.url, PRESIGNED_URL_TTL_SECONDS)
  }

  /** Returns the FFmpeg-generated HLS master playlist from storage. */
  async getHlsMasterPlaylist(id: TrackEntity['id']) {
    const track = await this.prisma.track.findUnique({
      where: { id },
      include: { audioFiles: { where: { format: DEFAULT_AUDIO_FORMAT }, take: 1 } },
    })
    if (!track) throw new NotFoundException('Track not found')
    if (track.processingStatus !== 'READY') throw new NotFoundException('HLS stream is not ready')

    try {
      const audioFile = track.audioFiles[0]
      if (!audioFile) throw new NotFoundException('HLS stream is not ready')
      const { stream } = await this.storage.getObjectStream(getHlsMasterKey(id, audioFile.url))
      return await text(stream)
    } catch {
      throw new NotFoundException('HLS stream is not ready')
    }
  }

  /** Proxies an HLS asset (playlist or segment) from storage. */
  async getHlsAsset(id: TrackEntity['id'], bitrate: number, asset: string) {
    if (!isAllowedHlsAsset(asset)) throw new NotFoundException('HLS asset not found')

    const file = await this.prisma.trackFile.findUnique({
      where: { trackId_format_bitrate: { trackId: id, format: DEFAULT_AUDIO_FORMAT, bitrate } },
    })
    if (!file) throw new NotFoundException('HLS quality not found')

    try {
      const { stream, contentLength } = await this.storage.getObjectStream(
        getHlsAssetKey(id, file.url, bitrate, asset),
      )

      return {
        stream,
        contentType: getHlsAssetContentType(asset),
        contentLength,
        immutable: !asset.endsWith('.m3u8'),
      }
    } catch {
      throw new NotFoundException('HLS asset not found')
    }
  }
}
