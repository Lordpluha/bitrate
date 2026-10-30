import { Readable } from 'node:stream'
import { setTimeout as delay } from 'node:timers/promises'
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
import { PLAYBACK_ERRORS } from './errors'
import { type AuthorizedPlaybackSession, PlaybackSessionService } from './playback-session.service'
import { pacedChunks } from './paced-stream'
import { planRenditionResponse, type RenditionSegment, renditionSegments } from './playback-segment'
import {
  CMAF_CONTENT_TYPE,
  CMAF_FORMAT,
  MANIFEST_VERSION,
  type RenditionStream,
  type TrackManifestPayload,
} from './track-playback.types'
import { PUBLIC_TRACK_WHERE } from './track-visibility'

/** Input for {@link TrackPlaybackService.openSession}. */
export type OpenPlaySessionInput = {
  trackId: string
  userId: string
  deviceId?: string
}

/** The manifest a play starts from, and the token every rendition request must carry. */
export type OpenedPlaySession = {
  manifest: TrackManifestPayload
  token: string
  /** Unix seconds. */
  expiresAt: number
}

/** Input for {@link TrackPlaybackService.getRenditionStream}. */
export type StreamRenditionInput = {
  trackId: string
  bitrate: number
  rangeHeader?: string
  token?: string
}

/**
 * Serves the single-file CMAF playback path: a playback session with the byte-range manifest,
 * then the rendition bytes — never more than one segment per request and no faster than real time
 * plus an allowance. See ADR-0020, ADR-0065 and ADR-0067.
 */
@Injectable()
export class TrackPlaybackService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE)
    private readonly storage: StorageService,
    private readonly sessions: PlaybackSessionService,
  ) {}

  private readonly logger = new Logger(TrackPlaybackService.name, { timestamp: true })

  /**
   * Builds the playback manifest for a track.
   * @throws NotFoundException when the track has no CMAF renditions.
   */
  async getManifest(trackId: string): Promise<TrackManifestPayload> {
    const track = await this.prisma.track.findFirst({
      where: { id: trackId, ...PUBLIC_TRACK_WHERE },
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
   * Opens a playback session for a playable track and returns its manifest with the token.
   * @throws NotFoundException when the track cannot play.
   */
  async openSession({
    trackId,
    userId,
    deviceId,
  }: OpenPlaySessionInput): Promise<OpenedPlaySession> {
    const manifest = await this.getManifest(trackId)
    const session = await this.sessions.open({
      userId,
      trackId,
      ...(deviceId ? { deviceId } : {}),
      durationMs: manifest.durationMs,
    })
    return { manifest, ...session }
  }

  /**
   * Streams a rendition for an authorised session (ADR-0067, D15): a range of at most one
   * fragment is served as asked and charged before any byte is read; a missing or oversized range
   * is served to the end of the file but released no faster than the session's real-time budget.
   * The file size and index come from the database, so a read costs a single storage request.
   * @throws ForbiddenException without a valid session for this track.
   * @throws PlaybackPacingError when the session is ahead of real time.
   * @throws NotFoundException when the rendition does not exist.
   */
  async getRenditionStream({
    trackId,
    bitrate,
    rangeHeader,
    token,
  }: StreamRenditionInput): Promise<RenditionStream> {
    const session = await this.sessions.authorize(token, trackId)

    const file = await this.prisma.trackFile.findFirst({
      where: {
        trackId,
        format: CMAF_FORMAT,
        bitrate,
        track: PUBLIC_TRACK_WHERE,
      },
      select: {
        url: true,
        bitrate: true,
        codec: true,
        size: true,
        initRangeStart: true,
        initRangeEnd: true,
        fragments: true,
        track: { select: { fragmentTimescale: true } },
      },
    })

    if (!file) {
      throw new NotFoundException(`Track ${trackId} has no ${bitrate}k CMAF rendition`)
    }

    const rendition = parseRendition(file)
    const timescale = file.track.fragmentTimescale
    if (!(rendition && timescale) || timescale <= 0) {
      this.logger.error(`Track ${trackId} has an invalid ${bitrate}k CMAF byte index`)
      throw new ServiceUnavailableException(PLAYBACK_ERRORS.RENDITION_UNAVAILABLE)
    }

    const segments = renditionSegments(rendition, timescale)
    const plan = planRenditionResponse(resolveRange(rangeHeader, rendition.size), segments)
    if (plan.kind === 'exact') await this.sessions.charge(session, plan.audioMs)

    const object = await this.storage.getObjectStream(file.url, `bytes=${plan.start}-${plan.end}`)

    return {
      stream:
        plan.kind === 'exact'
          ? object.stream
          : this.paced(object.stream as AsyncIterable<Buffer>, plan.start, segments, session),
      fileSize: rendition.size,
      /**
       * Always `audio/mp4`: storage drivers report `application/octet-stream`
       * for `.m4a`, which browsers refuse to play on the native fallback path.
       */
      contentType: CMAF_CONTENT_TYPE,
      start: plan.start,
      end: plan.end,
      contentLength: plan.contentLength,
      isPartial: true,
    }
  }

  /** Wraps storage bytes so they leave no faster than the session's budget; stops on disconnect. */
  private paced(
    source: AsyncIterable<Buffer>,
    startByte: number,
    segments: RenditionSegment[],
    session: AuthorizedPlaybackSession,
  ): NodeJS.ReadableStream {
    const listenerGone = new AbortController()
    const readable = Readable.from(
      pacedChunks({
        source,
        startByte,
        segments,
        charge: (audioMs) => this.sessions.charge(session, audioMs),
        sleep: (ms) => delay(ms, undefined, { signal: listenerGone.signal }).catch(() => undefined),
        signal: listenerGone.signal,
      }),
    )
    readable.once('close', () => listenerGone.abort())
    return readable
  }
}
