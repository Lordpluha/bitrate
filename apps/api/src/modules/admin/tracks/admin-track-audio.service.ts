import { PrismaService } from '@infra/prisma/prisma.service'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import { CMAF_CONTENT_TYPE, CMAF_FORMAT, resolveRange } from '@modules/tracks'
import { Inject, Injectable } from '@nestjs/common'
import { TrackAudioNotAvailableException, TrackNotFoundException } from './errors'

/** One resolved CMAF rendition, ready to stream or probe. */
type ResolvedTrackAudio = {
  url: string
  size: number
  bitrate: number
}

/** Rendition bytes plus the resolved byte window for a Range response. */
export type TrackAudioStream = {
  stream: NodeJS.ReadableStream
  fileSize: number
  contentType: string
  bitrate: number
  start: number
  end: number
  contentLength: number
  isPartial: boolean
}

/** Rendition headers only, with no storage round-trip. */
export type TrackAudioMeta = {
  fileSize: number
  contentType: string
  bitrate: number
}

/**
 * Resolves and streams a READY track's CMAF rendition for operator playback.
 * Deliberately does not filter `deletedAt` — a taken-down track must stay listenable so
 * an operator can review it before deciding whether to restore it.
 */
@Injectable()
export class AdminTrackAudioService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE)
    private readonly storage: StorageService,
  ) {}

  /**
   * @throws TrackNotFoundException when the track does not exist at all.
   * @throws TrackAudioNotAvailableException when it has no playable rendition.
   */
  private async resolveRendition(id: string, bitrate?: number): Promise<ResolvedTrackAudio> {
    const track = await this.prisma.track.findFirst({
      where: { id },
      select: { processingStatus: true },
    })
    if (!track) throw new TrackNotFoundException(id)

    const file = await this.prisma.trackFile.findFirst({
      where: {
        trackId: id,
        format: CMAF_FORMAT,
        ...(bitrate === undefined ? {} : { bitrate }),
        track: { processingStatus: 'READY', playbackVersion: 2 },
      },
      orderBy: { bitrate: 'desc' },
      select: { url: true, size: true, bitrate: true },
    })

    if (!file || file.size === null) {
      throw new TrackAudioNotAvailableException(id, track.processingStatus)
    }

    return { url: file.url, size: file.size, bitrate: file.bitrate }
  }

  /**
   * Streams the rendition bytes, honoring an inclusive HTTP Range.
   * @throws UnsatisfiableRangeError when the Range cannot be satisfied.
   */
  async stream(
    id: string,
    bitrate: number | undefined,
    rangeHeader?: string,
  ): Promise<TrackAudioStream> {
    const rendition = await this.resolveRendition(id, bitrate)
    const resolved = resolveRange(rangeHeader, rendition.size)
    const object = await this.storage.getObjectStream(
      rendition.url,
      resolved.isPartial ? `bytes=${resolved.start}-${resolved.end}` : undefined,
    )

    return {
      stream: object.stream,
      fileSize: rendition.size,
      /** Always `audio/mp4` — storage drivers may report a generic type for `.m4a`. */
      contentType: CMAF_CONTENT_TYPE,
      bitrate: rendition.bitrate,
      ...resolved,
    }
  }

  /** Returns rendition headers without opening a storage stream. */
  async head(id: string, bitrate?: number): Promise<TrackAudioMeta> {
    const rendition = await this.resolveRendition(id, bitrate)
    return { fileSize: rendition.size, contentType: CMAF_CONTENT_TYPE, bitrate: rendition.bitrate }
  }
}
