import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { rm } from 'node:fs/promises'
import { promisify } from 'node:util'
import { PrismaService } from '@infra/prisma/prisma.service'
import {
  type PublicImageFolder,
  removePublicImage,
  storePublicImage,
} from '@infra/storage/public-images'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ArtistTrackStatus, type Prisma } from '@prisma/client'
import type {
  ReleaseDraftVersionDto,
  ReorderReleaseTracksDto,
  UploadReleaseCoverDto,
  UploadReleaseTrackDto,
} from './dtos/release-media.dto'
import { RELEASE_ERRORS } from './errors'
import { lockOwnedDraft } from './release-draft-lock'
import {
  MAX_RELEASE_COVER_BYTES,
  RELEASE_AUDIO_EXTENSION_BY_MIME,
} from './release-media.interceptors'

const execFileAsync = promisify(execFile)

const COVER_FOLDER: PublicImageFolder = 'releases/covers'
const COVER_PATH_PREFIX = `/static/${COVER_FOLDER}/`

/** Longest stored original file name; it is display-only and never part of a storage key. */
const MAX_FILE_NAME_LENGTH = 255

/** ffprobe gets this long before the duration is left unknown instead of failing the upload. */
const PROBE_TIMEOUT_MS = 30_000

/** What a workspace shows for an uploaded draft; the storage key never leaves the server. */
const TRACK_DRAFT_SELECT = {
  id: true,
  title: true,
  version: true,
  status: true,
  duration: true,
  isDemo: true,
  isrc: true,
  audioFileName: true,
  audioSizeBytes: true,
} as const satisfies Prisma.ArtistTrackDraftSelect

/** A new master: uploaded but not yet attached to a draft row. */
interface StoredMaster {
  key: string
  fileName: string
  contentType: string
  sizeBytes: number
  duration: number | null
}

/**
 * Artwork and master audio of an owned draft release.
 *
 * Files are written to storage before the database transaction and removed again when it fails,
 * so a version conflict or a lost race never leaves a row pointing at a missing object. Objects
 * replaced or removed by a committed write are deleted afterwards on a best-effort basis.
 */
@Injectable()
export class ReleaseMediaService {
  private readonly logger = new Logger(ReleaseMediaService.name)

  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  async uploadCover(
    ownerArtistId: string,
    id: string,
    file: Express.Multer.File | undefined,
    input: UploadReleaseCoverDto,
  ) {
    if (!file) throw new BadRequestException(RELEASE_ERRORS.COVER_FILE_REQUIRED)
    const name = await storePublicImage(this.storage, COVER_FOLDER, file, {
      maxBytes: MAX_RELEASE_COVER_BYTES,
    })
    const cover = `${COVER_PATH_PREFIX}${name}`
    let previous: string | null
    let release: Awaited<ReturnType<typeof lockOwnedDraft>>
    try {
      ;({ previous, release } = await this.prisma.$transaction(async (tx) => {
        const current = await this.currentCover(tx, ownerArtistId, id)
        const locked = await lockOwnedDraft(tx, ownerArtistId, id, input.expectedUpdatedAt, {
          cover,
        })
        return { previous: current, release: locked }
      }))
    } catch (error) {
      await removePublicImage(this.storage, COVER_FOLDER, name)
      throw error
    }
    await removePublicImage(this.storage, COVER_FOLDER, coverName(previous))
    return { release, cover }
  }

  async removeCover(ownerArtistId: string, id: string, input: ReleaseDraftVersionDto) {
    const { previous, release } = await this.prisma.$transaction(async (tx) => {
      const current = await this.currentCover(tx, ownerArtistId, id)
      const locked = await lockOwnedDraft(tx, ownerArtistId, id, input.expectedUpdatedAt, {
        cover: null,
      })
      return { previous: current, release: locked }
    })
    await removePublicImage(this.storage, COVER_FOLDER, coverName(previous))
    return { release, cover: null }
  }

  /** Creates a recording on the draft from an uploaded master. Clears the accuracy confirmation. */
  async addTrack(
    ownerArtistId: string,
    id: string,
    file: Express.Multer.File | undefined,
    input: UploadReleaseTrackDto,
  ) {
    const master = await this.storeMaster(ownerArtistId, file)
    try {
      return await this.prisma.$transaction(async (tx) => {
        const release = await lockOwnedDraft(tx, ownerArtistId, id, input.expectedUpdatedAt, {
          accuracyConfirmedAt: null,
        })
        const last = await tx.artistTrackDraft.aggregate({
          where: { releaseId: id, deletedAt: null },
          _max: { position: true },
        })
        const track = await tx.artistTrackDraft.create({
          data: {
            ownerArtistId,
            releaseId: id,
            title: input.title,
            position: (last._max.position ?? -1) + 1,
            ...masterColumns(master),
          },
          select: TRACK_DRAFT_SELECT,
        })
        return { release, track: { ...track, hasAudio: true } }
      })
    } catch (error) {
      await this.deleteObject(master.key)
      throw error
    }
  }

  /**
   * Replaces the running order of the draft's recordings. The list must name every active
   * recording once, so a recording added or removed meanwhile fails the write instead of
   * being silently placed. Clears the accuracy confirmation.
   */
  reorderTracks(ownerArtistId: string, id: string, input: ReorderReleaseTracksDto) {
    return this.prisma.$transaction(async (tx) => {
      const release = await lockOwnedDraft(tx, ownerArtistId, id, input.expectedUpdatedAt, {
        accuracyConfirmedAt: null,
      })
      const active = await tx.artistTrackDraft.findMany({
        where: { releaseId: id, ownerArtistId, deletedAt: null },
        select: { id: true },
      })
      const known = new Set(active.map((track) => track.id))
      if (
        known.size !== input.trackIds.length ||
        input.trackIds.some((trackId) => !known.has(trackId))
      ) {
        throw new UnprocessableEntityException(RELEASE_ERRORS.TRACK_ORDER_MISMATCH)
      }
      for (const [position, trackId] of input.trackIds.entries()) {
        await tx.artistTrackDraft.update({ where: { id: trackId }, data: { position } })
      }
      return { release, trackIds: input.trackIds }
    })
  }

  /** Attaches a new master to an existing recording, for example a demo row without audio. */
  async replaceTrackAudio(
    ownerArtistId: string,
    id: string,
    trackId: string,
    file: Express.Multer.File | undefined,
    input: ReleaseDraftVersionDto,
  ) {
    const master = await this.storeMaster(ownerArtistId, file)
    let previousKey: string | null
    let result: Awaited<ReturnType<ReleaseMediaService['attachMaster']>>
    try {
      ;({ previousKey, result } = await this.prisma.$transaction(async (tx) => {
        const release = await lockOwnedDraft(tx, ownerArtistId, id, input.expectedUpdatedAt, {
          accuracyConfirmedAt: null,
        })
        const existing = await tx.artistTrackDraft.findFirst({
          where: { id: trackId, releaseId: id, ownerArtistId, deletedAt: null },
          select: { audioKey: true },
        })
        if (!existing) throw new NotFoundException(RELEASE_ERRORS.RECORDING_NOT_FOUND)
        const attached = await this.attachMaster(tx, release, trackId, master)
        return { previousKey: existing.audioKey, result: attached }
      }))
    } catch (error) {
      await this.deleteObject(master.key)
      throw error
    }
    if (previousKey) await this.deleteObject(previousKey)
    return result
  }

  /**
   * Removes a recording from the draft. The row is kept for history but loses its master and
   * ISRC, so the code can be reused and no private object outlives the recording.
   */
  async removeTrack(
    ownerArtistId: string,
    id: string,
    trackId: string,
    input: ReleaseDraftVersionDto,
  ) {
    const { release, previousKey } = await this.prisma.$transaction(async (tx) => {
      const locked = await lockOwnedDraft(tx, ownerArtistId, id, input.expectedUpdatedAt, {
        accuracyConfirmedAt: null,
      })
      const owned = { id: trackId, releaseId: id, ownerArtistId, deletedAt: null }
      const existing = await tx.artistTrackDraft.findFirst({
        where: owned,
        select: { audioKey: true },
      })
      if (!existing) throw new NotFoundException(RELEASE_ERRORS.RECORDING_NOT_FOUND)
      await tx.artistTrackDraft.updateMany({
        where: owned,
        data: {
          deletedAt: new Date(),
          isrc: null,
          audioKey: null,
          audioFileName: null,
          audioContentType: null,
          audioSizeBytes: null,
        },
      })
      return { release: locked, previousKey: existing.audioKey }
    })
    if (previousKey) await this.deleteObject(previousKey)
    return { release, trackId }
  }

  /** Streams the owner's uploaded master, honoring an HTTP Range for seeking. */
  async audioStream(ownerArtistId: string, id: string, trackId: string, range?: string) {
    const draft = await this.prisma.artistTrackDraft.findFirst({
      where: {
        id: trackId,
        releaseId: id,
        ownerArtistId,
        deletedAt: null,
        release: { deletedAt: null },
      },
      select: { audioKey: true, audioContentType: true },
    })
    if (!draft?.audioKey) throw new NotFoundException(RELEASE_ERRORS.AUDIO_NOT_FOUND)
    let object: Awaited<ReturnType<StorageService['getObjectStream']>>
    try {
      object = await this.storage.getObjectStream(draft.audioKey, range)
    } catch {
      throw new NotFoundException(RELEASE_ERRORS.AUDIO_NOT_FOUND)
    }
    return { ...object, contentType: draft.audioContentType ?? object.contentType }
  }

  private async attachMaster(
    tx: Prisma.TransactionClient,
    release: Awaited<ReturnType<typeof lockOwnedDraft>>,
    trackId: string,
    master: StoredMaster,
  ) {
    const [track] = await tx.artistTrackDraft.updateManyAndReturn({
      where: { id: trackId, releaseId: release.id, deletedAt: null },
      data: masterColumns(master),
      select: TRACK_DRAFT_SELECT,
    })
    if (!track) throw new NotFoundException(RELEASE_ERRORS.RECORDING_NOT_FOUND)
    return { release, track: { ...track, hasAudio: true } }
  }

  /** Moves the temporary upload into private storage; the local file is always removed. */
  private async storeMaster(
    ownerArtistId: string,
    file: Express.Multer.File | undefined,
  ): Promise<StoredMaster> {
    if (!file) throw new BadRequestException(RELEASE_ERRORS.AUDIO_FILE_REQUIRED)
    const extension = RELEASE_AUDIO_EXTENSION_BY_MIME[file.mimetype]
    try {
      if (!extension) throw new BadRequestException(RELEASE_ERRORS.AUDIO_TYPE_INVALID)
      const key = `release-masters/${ownerArtistId}/${randomUUID()}${extension}`
      const duration = await probeDurationSeconds(file.path)
      await this.storage.upload(key, createReadStream(file.path), file.mimetype)
      return {
        key,
        fileName: displayFileName(file.originalname),
        contentType: file.mimetype,
        sizeBytes: file.size,
        duration,
      }
    } finally {
      await rm(file.path, { force: true })
    }
  }

  private async currentCover(
    tx: Prisma.TransactionClient,
    ownerArtistId: string,
    id: string,
  ): Promise<string | null> {
    const release = await tx.release.findFirst({
      where: { id, ownerArtistId, deletedAt: null },
      select: { cover: true },
    })
    return release?.cover ?? null
  }

  /** Best-effort removal; an orphaned private object is waste, never a failed request. */
  private async deleteObject(key: string): Promise<void> {
    try {
      await this.storage.deleteObject(key)
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown error'
      this.logger.warn(`Unable to remove release master ${key}: ${reason}`)
    }
  }
}

function masterColumns(master: StoredMaster) {
  return {
    status: ArtistTrackStatus.READY,
    duration: master.duration,
    audioKey: master.key,
    audioFileName: master.fileName,
    audioContentType: master.contentType,
    audioSizeBytes: master.sizeBytes,
  } satisfies Prisma.ArtistTrackDraftUpdateManyMutationInput
}

/** The stored file name of a cover this module uploaded, or null for demo/external covers. */
function coverName(cover: string | null): string | null {
  return cover?.startsWith(COVER_PATH_PREFIX) ? cover.slice(COVER_PATH_PREFIX.length) : null
}

/**
 * Multer decodes multipart file names as latin1; re-decoding as UTF-8 restores non-ASCII names.
 * Path separators and control characters are dropped because the name is shown back to people.
 */
function displayFileName(originalName: string): string {
  const decoded = Buffer.from(originalName, 'latin1').toString('utf8')
  const cleaned = decoded
    .replace(/[\\/]/g, '_')
    .replace(/\p{Cc}/gu, '')
    .trim()
  return (cleaned || 'audio').slice(0, MAX_FILE_NAME_LENGTH)
}

/** Whole seconds of audio, or null when ffprobe is unavailable or cannot read the file. */
async function probeDurationSeconds(path: string): Promise<number | null> {
  try {
    const { stdout } = await execFileAsync(
      'ffprobe',
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', path],
      { timeout: PROBE_TIMEOUT_MS },
    )
    const seconds = Number.parseFloat(stdout.trim())
    return Number.isFinite(seconds) && seconds >= 0 ? Math.round(seconds) : null
  } catch {
    return null
  }
}
