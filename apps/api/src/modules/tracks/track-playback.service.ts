import { PrismaService } from '@infra/prisma/prisma.service'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'

/**
 * Structural shape of the playback manifest.
 *
 * Deliberately a plain type rather than the `TrackManifestEntity` class: the
 * Swagger CLI plugin inlines a `require()` of the *source* file for any class it
 * infers as a controller return type, which cannot resolve from `dist` at
 * runtime. The class still documents the response through `$ref` in
 * `GetTrackManifestSwagger`.
 */
export type TrackManifestPayload = {
  version: number
  timescale: number
  durationTicks: number
  durationMs: number
  renditions: {
    bitrate: number
    codec: string
    size: number
    initRange: [number, number]
    fragments: number[][]
  }[]
}

/** Format discriminator for CMAF rows in TrackFile. */
const CMAF_FORMAT = 'cmaf'

/** MIME type every CMAF rendition is served with. */
const CMAF_CONTENT_TYPE = 'audio/mp4'

/** Current manifest schema version. */
const MANIFEST_VERSION = 1

/** Resolved byte window for a Range response. */
export type ResolvedRange = {
  start: number
  end: number
  contentLength: number
  isPartial: boolean
}

/** A rendition file plus the range the client asked for. */
export type RenditionStream = {
  stream: NodeJS.ReadableStream
  fileSize: number
  contentType: string
} & ResolvedRange

/**
 * Serves the single-file CMAF playback path: the byte-range manifest and the
 * rendition bytes themselves. See ADR-0020.
 */
@Injectable()
export class TrackPlaybackService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE)
    private readonly storage: StorageService,
  ) {}

  /**
   * Builds the playback manifest for a track.
   * @throws NotFoundException when the track has no CMAF renditions.
   */
  async getManifest(trackId: string): Promise<TrackManifestPayload> {
    const track = await this.prisma.track.findFirst({
      where: { id: trackId, deletedAt: null },
      select: {
        fragmentTimescale: true,
        durationTicks: true,
        audioFiles: {
          where: { format: CMAF_FORMAT },
          orderBy: { bitrate: 'asc' },
          select: {
            bitrate: true,
            codec: true,
            size: true,
            initRangeStart: true,
            initRangeEnd: true,
            fragments: true,
          },
        },
      },
    })

    if (!track) {
      throw new NotFoundException(`Track ${trackId} not found`)
    }

    const { fragmentTimescale, durationTicks, audioFiles } = track

    if (audioFiles.length === 0 || fragmentTimescale === null || durationTicks === null) {
      throw new NotFoundException(`Track ${trackId} has no CMAF renditions`)
    }

    const renditions = audioFiles.map((file) => {
      if (file.initRangeStart === null || file.initRangeEnd === null || file.size === null) {
        throw new NotFoundException(`Track ${trackId} rendition ${file.bitrate} is incomplete`)
      }

      return {
        bitrate: file.bitrate,
        codec: file.codec ?? 'mp4a.40.2',
        size: file.size,
        initRange: [file.initRangeStart, file.initRangeEnd] as [number, number],
        fragments: (file.fragments ?? []) as number[][],
      }
    })

    return {
      version: MANIFEST_VERSION,
      timescale: fragmentTimescale,
      durationTicks,
      durationMs: Math.round((durationTicks * 1000) / fragmentTimescale),
      renditions,
    }
  }

  /**
   * Streams one rendition, honoring an inclusive HTTP Range.
   * The file size comes from the database, so a ranged read costs a single
   * storage request instead of opening the whole object to learn its length.
   * @throws NotFoundException when the rendition does not exist.
   */
  async getRenditionStream(
    trackId: string,
    bitrate: number,
    rangeHeader?: string,
  ): Promise<RenditionStream> {
    const file = await this.prisma.trackFile.findUnique({
      where: {
        trackId_format_bitrate: { trackId, format: CMAF_FORMAT, bitrate },
      },
      select: { url: true, size: true },
    })

    if (!file || file.size === null) {
      throw new NotFoundException(`Track ${trackId} has no ${bitrate}k CMAF rendition`)
    }

    const resolved = resolveRange(rangeHeader, file.size)
    const object = await this.storage.getObjectStream(
      file.url,
      resolved.isPartial ? `bytes=${resolved.start}-${resolved.end}` : undefined,
    )

    return {
      stream: object.stream,
      fileSize: file.size,
      /**
       * Always `audio/mp4`: storage drivers report `application/octet-stream`
       * for `.m4a`, which browsers refuse to play on the native fallback path.
       */
      contentType: CMAF_CONTENT_TYPE,
      ...resolved,
    }
  }
}

/**
 * Parses a single-window `bytes=` Range header against a known file size.
 * Unparseable or unsatisfiable ranges fall back to the whole object rather than
 * failing the request, matching how browsers retry a rejected range.
 */
export function resolveRange(rangeHeader: string | undefined, fileSize: number): ResolvedRange {
  const whole: ResolvedRange = {
    start: 0,
    end: fileSize - 1,
    contentLength: fileSize,
    isPartial: false,
  }

  if (!rangeHeader) return whole

  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim())
  if (!match) return whole

  const [, rawStart, rawEnd] = match
  if (rawStart === '' && rawEnd === '') return whole

  let start: number
  let end: number

  if (rawStart === '') {
    /** Suffix form `bytes=-N`: the last N bytes. */
    const suffixLength = Number(rawEnd)
    if (suffixLength <= 0) return whole
    start = Math.max(0, fileSize - suffixLength)
    end = fileSize - 1
  } else {
    start = Number(rawStart)
    end = rawEnd === '' ? fileSize - 1 : Number(rawEnd)
  }

  if (!(Number.isFinite(start) && Number.isFinite(end))) return whole
  if (start >= fileSize || start > end) return whole

  end = Math.min(end, fileSize - 1)

  return { start, end, contentLength: end - start + 1, isPartial: true }
}
