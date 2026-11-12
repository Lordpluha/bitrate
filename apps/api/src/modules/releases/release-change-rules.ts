import { randomUUID } from 'node:crypto'
import { IMAGE_EXTENSION_BY_MIME } from '@common/utils/image'
import { validatePublicImage } from '@infra/storage/public-images'
import type { StorageService } from '@infra/storage/storage.types'
import { Logger } from '@nestjs/common'
import {
  Prisma,
  ReleaseChangeField,
  ReleaseChangeStatus,
  ReleaseStatus,
  ReleaseUnpublishedBy,
} from '@prisma/client'
import { MAX_RELEASE_COVER_BYTES } from './release-media.interceptors'

/**
 * Proposed covers wait here, outside every public image folder, so listeners cannot load one
 * before staff approve it. Owner and staff see them through short-lived signed links.
 */
const PENDING_COVER_FOLDER = 'releases/pending-covers'

/** How long a signed link to a proposed cover stays valid, in seconds. */
const PENDING_COVER_LINK_TTL = 15 * 60

const logger = new Logger('ReleaseChanges', { timestamp: true })

/** The release row a change request reads and writes, locked for the transaction. */
export type ChangeableRelease = {
  id: string
  ownerArtistId: string
  title: string
  cover: string | null
  status: ReleaseStatus
  unpublishedBy: ReleaseUnpublishedBy | null
  isDemo: boolean
  albumId: string | null
  updatedAt: Date
}

/**
 * Locks a release row so submissions, decisions, deletion and takedown run one after another.
 * With `ownerArtistId` a release of another artist reads as missing.
 */
export async function lockReleaseForChanges(
  tx: Prisma.TransactionClient,
  releaseId: string,
  ownerArtistId?: string,
): Promise<ChangeableRelease | null> {
  const owner = ownerArtistId
    ? Prisma.sql`AND "ownerArtistId" = ${ownerArtistId}::uuid`
    : Prisma.empty
  const rows = await tx.$queryRaw<ChangeableRelease[]>(Prisma.sql`
    SELECT id, "ownerArtistId", title, cover, status::text AS status,
      "unpublishedBy"::text AS "unpublishedBy", "isDemo", "albumId", "updatedAt"
    FROM "Release"
    WHERE id = ${releaseId}::uuid AND "deletedAt" IS NULL ${owner}
    FOR UPDATE`)
  return rows[0] ?? null
}

/**
 * Only a live release, or one its artist took offline, takes changes. A Bitrate takedown stays
 * final, demos are sample data, and every earlier state is still edited as a draft or reviewed.
 */
export function acceptsChanges(
  release: Pick<ChangeableRelease, 'isDemo' | 'status' | 'unpublishedBy'>,
): boolean {
  if (release.isDemo) return false
  if (release.status === ReleaseStatus.RELEASED) return true
  return (
    release.status === ReleaseStatus.UNPUBLISHED &&
    release.unpublishedBy === ReleaseUnpublishedBy.ARTIST
  )
}

/** What a change replaces; unique among the pending changes of a release. */
export function pendingTarget(field: ReleaseChangeField, draftId?: string | null): string {
  return field === ReleaseChangeField.RECORDING_TITLE ? `${field}:${draftId}` : field
}

/** Stores a proposed cover privately after checking its content, returning the storage key. */
export async function storePendingCover(
  storage: StorageService,
  file: Express.Multer.File,
): Promise<string> {
  const mime = validatePublicImage(file, { maxBytes: MAX_RELEASE_COVER_BYTES })
  const key = `${PENDING_COVER_FOLDER}/${randomUUID()}${IMAGE_EXTENSION_BY_MIME[mime]}`
  await storage.upload(key, file.buffer, mime)
  return key
}

/** Whether a stored proposed value is a private cover key rather than a title or public path. */
function isPendingCoverKey(value: string | null | undefined): value is string {
  return !!value?.startsWith(`${PENDING_COVER_FOLDER}/`)
}

/** Best-effort removal of proposed covers that will never go public; leftovers are waste only. */
export async function removePendingCovers(
  storage: StorageService,
  keys: readonly (string | null | undefined)[],
): Promise<void> {
  await Promise.all(
    keys.filter(isPendingCoverKey).map(async (key) => {
      try {
        await storage.deleteObject(key)
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'unknown error'
        logger.warn(`Unable to remove proposed cover ${key}: ${reason}`)
      }
    }),
  )
}

/** A stored change as the artist and staff read it. */
export type ReleaseChangeRecord = {
  id: string
  requestId: string
  field: ReleaseChangeField
  draftId: string | null
  previousValue: string | null
  proposedValue: string
  status: ReleaseChangeStatus
  reason: string | null
  decidedAt: Date | null
  createdAt: Date
}

export const RELEASE_CHANGE_SELECT = {
  id: true,
  requestId: true,
  field: true,
  draftId: true,
  previousValue: true,
  proposedValue: true,
  status: true,
  reason: true,
  decidedAt: true,
  createdAt: true,
} as const satisfies Prisma.ReleaseChangeSelect

/**
 * The client view of a change. A proposed cover is a signed link while pending, the public
 * path once approved, and null after any other outcome because its file is gone.
 */
export async function toChangeView(storage: StorageService, change: ReleaseChangeRecord) {
  const { draftId, proposedValue, ...rest } = change
  const view = { ...rest, recordingId: draftId, proposedValue: proposedValue as string | null }
  if (change.field !== ReleaseChangeField.RELEASE_COVER) return view
  if (change.status === ReleaseChangeStatus.APPROVED) return view
  if (change.status !== ReleaseChangeStatus.PENDING || !isPendingCoverKey(proposedValue)) {
    return { ...view, proposedValue: null }
  }
  return {
    ...view,
    proposedValue: await storage.getPresignedUrl(proposedValue, PENDING_COVER_LINK_TTL),
  }
}

/** Ends every pending change of a release; returns proposed covers to remove after commit. */
export async function cancelPendingChanges(
  tx: Prisma.TransactionClient,
  releaseId: string,
): Promise<string[]> {
  const now = new Date()
  const cancelled = await tx.releaseChange.updateManyAndReturn({
    where: { releaseId, status: ReleaseChangeStatus.PENDING },
    data: { status: ReleaseChangeStatus.CANCELLED, pendingTarget: null, decidedAt: now },
    select: { requestId: true, proposedValue: true },
  })
  if (cancelled.length) {
    await tx.releaseChangeRequest.updateMany({
      where: { id: { in: [...new Set(cancelled.map((change) => change.requestId))] } },
      data: { closedAt: now },
    })
  }
  return cancelled.map((change) => change.proposedValue).filter(isPendingCoverKey)
}
