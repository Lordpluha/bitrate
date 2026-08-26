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
import { parseRendition } from './cmaf-manifest'
import { resolveRange } from './cmaf-range'
import {
  CMAF_CONTENT_TYPE,
  CMAF_FORMAT,
  MANIFEST_VERSION,
  type RenditionStream,
  type TrackManifestPayload,
} from './track-playback.types'

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
