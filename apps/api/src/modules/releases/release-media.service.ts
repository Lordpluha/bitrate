import { PrismaService } from '@infra/prisma/prisma.service'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import { deleteObjectQuietly } from '@modules/tracks/storage-cleanup'
import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type {
  ReleaseDraftVersionDto,
  ReorderReleaseTracksDto,
  UploadReleaseTrackDto,
} from './dtos/release-media.dto'
import { RELEASE_ERRORS } from './errors'
import { lockOwnedDraft } from './release-draft-lock'
import { masterColumns, type StoredMaster, storeReleaseMaster } from './release-master'

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
  waveform: true,
} as const satisfies Prisma.ArtistTrackDraftSelect

/** The release summary returned by {@link lockOwnedDraft}. */
type LockedDraft = Awaited<ReturnType<typeof lockOwnedDraft>>

/** A recording as a workspace shows it. */
type TrackDraft = Prisma.ArtistTrackDraftGetPayload<{ select: typeof TRACK_DRAFT_SELECT }>

/** A committed master replacement and the object it superseded. */
type ReplacedAudio = { previousKey: string | null; release: LockedDraft; track: TrackDraft }

/** Identifies one live recording of an owned draft. */
type OwnedRecording = { ownerArtistId: string; id: string; trackId: string }

/**
 * Recordings and master audio of an owned draft release.
 *
 * Masters are written to storage before the database transaction and removed again when it
 * fails, so a version conflict or a lost race never leaves a row pointing at a missing object.
 * Objects replaced or removed by a committed write are deleted afterwards on a best-effort basis.
 */
@Injectable()
export class ReleaseMediaService {
  private readonly logger = new Logger(ReleaseMediaService.name)

  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  /** Creates a recording on the draft from an uploaded master. Clears the accuracy confirmation. */
  async addTrack(
    ownerArtistId: string,
    id: string,
    file: Express.Multer.File | undefined,
    input: UploadReleaseTrackDto,
  ) {
    const master = await storeReleaseMaster(this.storage, ownerArtistId, file)
    return await this.discardMasterOnFailure(master, () =>
      this.prisma.$transaction(async (tx) => {
        const release = await lockOwnedDraft(tx, ownerArtistId, id, input.expectedUpdatedAt, {
          accuracyConfirmedAt: null,
        })
        const track = await tx.artistTrackDraft.create({
          data: {
            ownerArtistId,
            releaseId: id,
            title: input.title,
            position: await this.nextPosition(tx, id),
            ...masterColumns(master),
          },
          select: TRACK_DRAFT_SELECT,
        })
        return { release, track: { ...track, hasAudio: true } }
      }),
    )
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
      // One statement for the whole order; positions are zero-based, ORDINALITY is one-based.
      await tx.$executeRaw(Prisma.sql`
        UPDATE "ArtistTrackDraft" AS draft
        SET "position" = ordered.ordinality - 1, "updatedAt" = NOW()
        FROM unnest(${input.trackIds}::uuid[]) WITH ORDINALITY AS ordered(id, ordinality)
        WHERE draft."id" = ordered.id AND draft."releaseId" = ${id}::uuid
      `)
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
    const master = await storeReleaseMaster(this.storage, ownerArtistId, file)
    const { previousKey, release, track } = await this.discardMasterOnFailure(master, () =>
      this.attachMaster({ ownerArtistId, id, trackId }, master, input.expectedUpdatedAt),
    )
    if (previousKey) await deleteObjectQuietly(this.storage, previousKey, this.logger)
    return { release, track: { ...track, hasAudio: true } }
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
      const previous = await this.currentAudioKey(tx, { ownerArtistId, id, trackId })
      await tx.artistTrackDraft.updateMany({
        where: owned,
        data: {
          deletedAt: new Date(),
          isrc: null,
          audioKey: null,
          audioFileName: null,
          audioContentType: null,
          audioSizeBytes: null,
          waveform: [],
        },
      })
      return { release: locked, previousKey: previous }
    })
    if (previousKey) await deleteObjectQuietly(this.storage, previousKey, this.logger)
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

  /** Points an existing recording at a stored master under the draft lock. */
  private attachMaster(
    recording: OwnedRecording,
    master: StoredMaster,
    expectedUpdatedAt: string,
  ): Promise<ReplacedAudio> {
    const { ownerArtistId, id, trackId } = recording
    return this.prisma.$transaction(async (tx) => {
      const release = await lockOwnedDraft(tx, ownerArtistId, id, expectedUpdatedAt, {
        accuracyConfirmedAt: null,
      })
      const previousKey = await this.currentAudioKey(tx, recording)
      // The draft lock holds the release row, so the recording cannot vanish before this write.
      const track = await tx.artistTrackDraft.update({
        where: { id: trackId },
        data: masterColumns(master),
        select: TRACK_DRAFT_SELECT,
      })
      return { previousKey, release, track }
    })
  }

  /**
   * The storage key of a live recording's master, or null when it has none.
   * @throws NotFoundException when the recording is missing, removed or someone else's.
   */
  private async currentAudioKey(
    tx: Prisma.TransactionClient,
    { ownerArtistId, id, trackId }: OwnedRecording,
  ): Promise<string | null> {
    const existing = await tx.artistTrackDraft.findFirst({
      where: { id: trackId, releaseId: id, ownerArtistId, deletedAt: null },
      select: { audioKey: true },
    })
    if (!existing) throw new NotFoundException(RELEASE_ERRORS.RECORDING_NOT_FOUND)
    return existing.audioKey
  }

  /** The position after the draft's last active recording; zero for the first one. */
  private async nextPosition(tx: Prisma.TransactionClient, id: string): Promise<number> {
    const last = await tx.artistTrackDraft.aggregate({
      where: { releaseId: id, deletedAt: null },
      _max: { position: true },
    })
    return (last._max.position ?? -1) + 1
  }

  /** Runs a write that attaches `master`, deleting the stored object again when it fails. */
  private async discardMasterOnFailure<T>(master: StoredMaster, write: () => Promise<T>) {
    try {
      return await write()
    } catch (error) {
      await deleteObjectQuietly(this.storage, master.key, this.logger)
      throw error
    }
  }
}
