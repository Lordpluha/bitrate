import { PrismaService } from '@infra/prisma/prisma.service'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common'

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
    fragments: [number, number, number, number][]
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

/** Carries the representation size required by an RFC 9110 416 response. */
export class UnsatisfiableRangeError extends Error {
  constructor(readonly fileSize: number) {
    super('Requested byte range is not satisfiable')
  }
}

type StoredRendition = {
  bitrate: number
  codec: string | null
  size: number | null
  initRangeStart: number | null
  initRangeEnd: number | null
  fragments: unknown
}

/** Validates one persisted fragment tuple without trusting a JSON cast. */
function parseFragment(value: unknown, fileSize: number): [number, number, number, number] | null {
  if (!Array.isArray(value) || value.length !== 4) return null
  const [startTicks, durationTicks, offset, length] = value
  if (
    ![startTicks, durationTicks, offset, length].every(Number.isSafeInteger) ||
    (startTicks as number) < 0 ||
    (durationTicks as number) <= 0 ||
    (offset as number) < 0 ||
    (length as number) <= 0 ||
    (offset as number) + (length as number) > fileSize
  ) {
    return null
  }

  return [startTicks as number, durationTicks as number, offset as number, length as number]
}

/** Converts one database rendition into the strict public manifest shape. */
function parseRendition(file: StoredRendition): TrackManifestPayload['renditions'][number] | null {
  if (
    !Number.isSafeInteger(file.bitrate) ||
    file.bitrate <= 0 ||
    !Number.isSafeInteger(file.size) ||
    (file.size ?? 0) <= 0 ||
    !Number.isSafeInteger(file.initRangeStart) ||
    !Number.isSafeInteger(file.initRangeEnd) ||
    (file.initRangeStart ?? -1) < 0 ||
    (file.initRangeEnd ?? -1) < (file.initRangeStart ?? 0) ||
    (file.initRangeEnd ?? 0) >= (file.size ?? 0) ||
    typeof file.codec !== 'string' ||
    file.codec.trim() === '' ||
    !Array.isArray(file.fragments) ||
    file.fragments.length === 0
  ) {
    return null
  }

  const fragments = file.fragments.map((fragment) => parseFragment(fragment, file.size as number))
  if (fragments.some((fragment) => fragment === null)) return null

  const parsedFragments = fragments as [number, number, number, number][]
  for (const [index, fragment] of parsedFragments.entries()) {
    const previous = parsedFragments[index - 1]
    if (!previous) continue
    if (fragment[0] !== previous[0] + previous[1]) return null
    if (fragment[2] < previous[2] + previous[3]) return null
  }

  return {
    bitrate: file.bitrate,
    codec: file.codec,
    size: file.size as number,
    initRange: [file.initRangeStart as number, file.initRangeEnd as number],
    fragments: parsedFragments,
  }
}

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

  private readonly logger = new Logger(TrackPlaybackService.name, { timestamp: true })

  /**
   * Builds the playback manifest for a track.
   * @throws NotFoundException when the track has no CMAF renditions.
   */
  async getManifest(trackId: string): Promise<TrackManifestPayload> {
    const track = await this.prisma.track.findFirst({
      where: { id: trackId, deletedAt: null, processingStatus: 'READY', playbackVersion: 2 },
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

    if (
      audioFiles.length === 0 ||
      !Number.isSafeInteger(fragmentTimescale) ||
      (fragmentTimescale ?? 0) <= 0 ||
      !Number.isSafeInteger(durationTicks) ||
      (durationTicks ?? 0) <= 0
    ) {
      throw new NotFoundException(`Track ${trackId} has no CMAF renditions`)
    }

    const renditions = audioFiles.map(parseRendition)
    if (renditions.some((rendition) => rendition === null)) {
      this.logger.error(`Track ${trackId} contains an invalid persisted CMAF byte index`)
      throw new ServiceUnavailableException('Track playback manifest is unavailable')
    }

    const validRenditions = renditions as TrackManifestPayload['renditions']
    const referenceGrid = validRenditions[0]?.fragments
    const hasMismatchedGrid = validRenditions.some(
      (rendition) =>
        rendition.fragments.length !== referenceGrid?.length ||
        rendition.fragments.some(
          (fragment, index) =>
            fragment[0] !== referenceGrid[index]?.[0] || fragment[1] !== referenceGrid[index]?.[1],
        ),
    )
    const finalFragment = referenceGrid?.at(-1)
    if (
      hasMismatchedGrid ||
      !finalFragment ||
      finalFragment[0] + finalFragment[1] !== durationTicks
    ) {
      this.logger.error(`Track ${trackId} contains inconsistent CMAF rendition timelines`)
      throw new ServiceUnavailableException('Track playback manifest is unavailable')
    }

    return {
      version: MANIFEST_VERSION,
      timescale: fragmentTimescale as number,
      durationTicks: durationTicks as number,
      durationMs: Math.round(((durationTicks as number) * 1000) / (fragmentTimescale as number)),
      renditions: validRenditions,
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
    const file = await this.prisma.trackFile.findFirst({
      where: {
        trackId,
        format: CMAF_FORMAT,
        bitrate,
        track: { deletedAt: null, processingStatus: 'READY', playbackVersion: 2 },
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
 * Invalid and unsatisfiable ranges throw so the controller can emit an RFC 9110
 * 416 response with the required wildcard `Content-Range` value.
 */
export function resolveRange(rangeHeader: string | undefined, fileSize: number): ResolvedRange {
  if (!Number.isSafeInteger(fileSize) || fileSize <= 0) {
    throw new UnsatisfiableRangeError(Math.max(0, fileSize))
  }

  const whole: ResolvedRange = {
    start: 0,
    end: fileSize - 1,
    contentLength: fileSize,
    isPartial: false,
  }

  if (!rangeHeader) return whole

  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim())
  if (!match) throw new UnsatisfiableRangeError(fileSize)

  const [, rawStart, rawEnd] = match
  if (rawStart === '' && rawEnd === '') throw new UnsatisfiableRangeError(fileSize)

  let start: number
  let end: number

  if (rawStart === '') {
    /** Suffix form `bytes=-N`: the last N bytes. */
    const suffixLength = Number(rawEnd)
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
      throw new UnsatisfiableRangeError(fileSize)
    }
    start = Math.max(0, fileSize - suffixLength)
    end = fileSize - 1
  } else {
    start = Number(rawStart)
    end = rawEnd === '' ? fileSize - 1 : Number(rawEnd)
  }

  if (!(Number.isSafeInteger(start) && Number.isSafeInteger(end))) {
    throw new UnsatisfiableRangeError(fileSize)
  }
  if (start < 0 || end < 0 || start >= fileSize || start > end) {
    throw new UnsatisfiableRangeError(fileSize)
  }

  end = Math.min(end, fileSize - 1)

  return { start, end, contentLength: end - start + 1, isPartial: true }
}
